# QUESTION: 만약에 도커라이즈 한다면, 도커파일은? 크기가 큰 아티팩트들은?
import asyncio
import json
import os
import subprocess
import torch
import torchaudio
import tempfile
from fastapi import FastAPI, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from openai import OpenAI
from model import model
import filetype
from dotenv import load_dotenv


app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:8080",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

load_dotenv()
OPENAI_API_KEY = os.environ["OPENAI_API_KEY"]
client = OpenAI(api_key=OPENAI_API_KEY)


class WhisperResponse(BaseModel):
    text: str


def convert_to_wav(input_file, output_file):
    subprocess.call(["ffmpeg", "-i", input_file, "-acodec", "pcm_s16le", "-ar", "44100", "-ac", "2", output_file])


def get_audio_caption(audio_file_path):
    USE_CUDA = torch.cuda.is_available()
    device = torch.device("cuda:0" if USE_CUDA else "cpu")
    SAMPLE_RATE = 16000
    set_length = 30

    audio_file, _ = torchaudio.load(audio_file_path)

    if audio_file.shape[1] > (SAMPLE_RATE * set_length):
        audio_file = audio_file[: SAMPLE_RATE * set_length]
    if audio_file.shape[1] < (SAMPLE_RATE * set_length):
        pad_len = (SAMPLE_RATE * set_length) - audio_file.shape[1]
        pad_val = torch.zeros((1, pad_len))
        if audio_file.shape[0] != 1:
            audio_file = torch.mean(audio_file, dim=0, keepdim=True)
        audio_file = torch.cat((audio_file, pad_val), dim=1)

    if len(audio_file.size()) == 3:
        audio_file = audio_file.unsqueeze(0)

    pred_caption = model(audio_file.to(device), None, beam_search=True)[0][0]
    return pred_caption


def get_openai_response(client, caption):
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {
                "role": "system",
                "content": [
                    {
                        "type": "text",
                        "text": '나는 자막 시각화를 연구하는 연구자야. 너는 지금부터 내가 제공한 audio caption 을 효과적으로 시각화하기 위한 메타데이터를 제공해줘.\n\n- sound word 는 해당 caption 에 대응하는 한국어 sound word, 즉 의성어 의태어 효과음 등, 소리 그 자체에 대한 발음 표현으로 제공해줘. 해당 표현은 한국어에 맞추어 제공해줘.\n- 자막 스타일은 sound word 를 시각화하기 위한 데이터로 제공해줘. 한국어 평어체로 작성해줘.\n- description 은 netflix 스타일로 해당 상황 및 장면에 잘 어울리는 짧은 상황 소개로 제공해줘.\n- font_size 는 rem 형태로 제공해줘 (px 금지)\n- 자막 스타일을 효과적으로 시각화 하기 위한 데이터는 CSS 에 사용할 수 있는 형태로 제공해줘.\n\n데이터는 다음 foramt으로 제공해줘:\n{\n"sound_word":\n"description"\n"font_family":\n"font_weight":\n"font_size":\n"font_color":\n"letter_spacing":\n"text_shadow":\n"outline":\n}\n\n\n예시:\nQuestion:\nThe dog barked loudly\n\nAnswer:\n\n{\n"sound_word": "왈! 왈!",\n"description": "개 짖는 소리",\n"font_family":  "Noto Sans KR",\n"font_weight": "800",\n"font_size": "2rem",\n"font_color": "#FFFFFF",\n"letter_spacing": "-2px",\n"text_shadow": "0 0 10px #0000FF, 0 0 20px #0000FF, 0 0 30px #0000FF, 0 0 40px #0000FF, 0 0 70px #0000FF, 0 0 80px #0000FF, 0 0 100px #0000FF, 0 0 150px #0000FF",\n"outline": "2px solid #FFFFFF",\n}',
                    }
                ],
            },
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": caption,
                    }
                ],
            },
        ],
        temperature=1,
        max_tokens=1024,
        top_p=1,
        frequency_penalty=0,
        presence_penalty=0,
    )
    return response.choices[0].message.content


@app.post("/transcribe")
async def transcribe(file: UploadFile):
    file_bytes = await file.read()
    file_type = filetype.guess_mime(file_bytes)
    if file_type not in ["video/x-matroska", "video/webm", "video/mp4"]:
        print(f"Invalid file type. Only 'video/x-matroska', 'video/webm', and 'video/mp4' are supported. Current file type: {file_type}")
        raise HTTPException(
            status_code=400, detail=f"Invalid file type. Only 'video/x-matroska', 'video/webm', and 'video/mp4' are supported. Current file type: {file_type}"
        )

    temp_input_file = tempfile.NamedTemporaryFile(suffix=".mkv", delete=False)
    temp_input_file.write(file_bytes)
    temp_input_file.close()

    temp_output_file = tempfile.NamedTemporaryFile(suffix=".wav", delete=False)
    temp_output_file.close()

    new_output_file_name = f'{temp_output_file.name.split(".")[0]}_new.wav'

    convert_to_wav(temp_input_file.name, new_output_file_name)
    caption = get_audio_caption(new_output_file_name)
    # TODO: JSON 포맷 맞는지 검사 및 재시도 코드 도입 가능.
    MAX_RETRIES = 3
    retry_count = 0
    while retry_count < MAX_RETRIES:
        try:
            gpt_response = get_openai_response(client, caption)
            data = json.loads(gpt_response)
            return JSONResponse(content=[data])
        except json.JSONDecodeError:
            retry_count += 1
            if retry_count == MAX_RETRIES:
                raise HTTPException(status_code=500, detail="Failed to parse GPT response as JSON")
            else:
                # 잠시 대기 후 다시 시도
                await asyncio.sleep(1)
    return JSONResponse(content={"error": "Failed to parse GPT response as JSON"})

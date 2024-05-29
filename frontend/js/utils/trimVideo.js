const MAX_TRIM_DURATION = 10;

export default async function trimVideo(startTime, endTime, videoElement) {
  if (endTime <= startTime) {
    console.error('Error: End time should be greater than start time.');
    return;
  }

  if (endTime - startTime > MAX_TRIM_DURATION) {
    console.error(`Error: Trimming duration exceeds ${MAX_TRIM_DURATION} seconds.`);
    return;
  }

  // const trimmedVideo = videoElement.cloneNode();
  // trimmedVideo.src = videoElement.src;
  // trimmedVideo.currentTime = startTime;
  videoElement.pause();
  videoElement.currentTime = startTime;

  const recorder = new MediaRecorder(videoElement.captureStream());
  const chunks = [];

  recorder.ondataavailable = (event) => {
    chunks.push(event.data);
  };

  return new Promise((resolve, reject) => {
    recorder.onstop = async () => {
      const blob = new Blob(chunks, { type: 'video/mp4' });

      try {
        const formData = new FormData();
        formData.append('file', blob, 'trimmed_video.mp4');

        const response = await fetch('http://localhost:8000/transcribe', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Transcription:', data)
        resolve(data);
      } catch (error) {
        console.error('Error during transcription:', error);
        reject(error);
      }
    };

    // videoElement.addEventListener(
    //   'loadedmetadata',
    //   () => {
    //     videoElement.play();
    //     recorder.start();
    //     setTimeout(
    //       () => {
    //         videoElement.pause();
    //         recorder.stop();
    //       },
    //       (endTime - startTime) * 1000,
    //     );
    //   },
    //   { once: true },
    // );

    videoElement.play();
    recorder.start();
    setTimeout(
      () => {
        recorder.stop();
        videoElement.pause();
      },
      (endTime - startTime) * 1000,
    );
  });
}
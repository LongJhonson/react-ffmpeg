import { useState, useEffect } from "react";
import "./App.css";

const videoSize = {
  width: 640,
  height: 480,
};

import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
const ffmpeg = createFFmpeg({ log: true });

function App() {
  console.log("render");
  const [ready, setReady] = useState(false);
  const [video, setVideo] = useState();
  const [gif, setGif] = useState();
  const [loadingVideo, setLoadingVideo] = useState(true);
  const [cutting, setCutting] = useState(false);
  const [params, setParams] = useState({
    start: 0,
    end: 0,
  });

  const load = async () => {
    await ffmpeg.load();
    setReady(true);
  };

  useEffect(() => {
    load();
    const fetchVideo = async () => {
      const response = await fetch(
        "http://localhost:3002/files/getVideo/2/Sample Video Test HD - LIVE (24_7).mp4"
      );
      const blob = await response.blob();
      setVideo(blob);
      setLoadingVideo(false);
    };
    fetchVideo();
  }, []);

  const secondsToHms = (d) => {
    //function to convert seconds to hh:mm:ss format
    return new Date(d * 1000).toISOString().slice(11, 19);
  };

  const cutVideo = async () => {
    setCutting(true);
    ffmpeg.FS(
      "writeFile",
      "test.mp4",
      await fetchFile(
        "http://localhost:3002/files/getVideo/2/Sample Video Test HD - LIVE (24_7).mp4"
      )
    );
    await ffmpeg.run(
      //primer corte
      "-i",
      "test.mp4",
      "-ss",
      secondsToHms(0),
      "-to",
      secondsToHms(params.start),
      "-c",
      "copy",
      "out1.ts"
    );
    console.log(
      "-i",
      "test.mp4",
      "-ss",
      secondsToHms(0),
      "-to",
      secondsToHms(params.start),
      "-c",
      "copy",
      "out1.ts"
    );
    const out1 = ffmpeg.FS("readFile", "out1.ts");
    await ffmpeg.run(
      //segundo corte
      "-i",
      "test.mp4",
      "-ss",
      secondsToHms(params.end),
      "-c",
      "copy",
      "out2.ts"
    );
    console.log(
      //segundo corte
      "-i",
      "test.mp4",
      "-ss",
      secondsToHms(params.end),
      "-c",
      "copy",
      "out2.ts"
    );
    const out2 = ffmpeg.FS("readFile", "out2.ts");
    await ffmpeg.run(
      //concatenar
      "-i",
      "concat:out1.ts|out2.ts",
      "-c:a",
      "copy",
      "-c:v",
      "copy",
      "output.mp4"
    );
    console.log(
      "concat ",
      "-i",
      "concat:out1.mp4|out2.mp4",
      "-c:a",
      "copy",
      "-c:v",
      "copy",
      "output.mp4"
    );
    const data = ffmpeg.FS("readFile", "output.mp4");
    const url = URL.createObjectURL(
      new Blob([data.buffer], { type: "video/mp4" })
    );
    setGif(url);
    setCutting(false);
  };

  return ready ? (
    <div className="App">
      <div className="input">
        <h1>Input</h1>
        {loadingVideo ? (
          <h3>Loading video...</h3>
        ) : (
          <>
            <h3>Video loaded</h3>
            <video
              controls
              width={videoSize.width}
              src={URL.createObjectURL(video)}></video>
          </>
        )}

        <h3>Result</h3>
        <div>
          <h5>Start</h5>
          <input
            type="number"
            onChange={(e) => setParams({ ...params, start: e.target.value })}
          />
        </div>
        <div>
          <h5>End</h5>
          <input
            type="number"
            onChange={(e) => setParams({ ...params, end: e.target.value })}
          />
        </div>
        <button onClick={cutVideo}>Cut</button>
      </div>
      <div className="output">
        <h1>Output</h1>
        {cutting ? (
          <p>cutting...</p>
        ) : (
          <>
            <h3>Preview</h3>
            {gif && <video controls src={gif} width={videoSize.width} />}
          </>
        )}
      </div>
    </div>
  ) : (
    <p>loading...</p>
  );
}

export default App;

import { useEffect, useState } from "react";

import classes from "./modal.download.module.css";

import { Modal, LinearProgress, List, Button } from "@mui/material";
import { Download } from "@mui/icons-material";

function sseevent(message) {
  let type = 'message', start = 0;
  if (message.startsWith('event: ')) {
    start = message.indexOf('\n');
    type = message.slice(7, start);
  }
  start = message.indexOf(': ', start) + 2;
  let data = message.slice(start, message.length);

  return new MessageEvent(type, { data: data })
}

export function XhrSource(url, opts) {
  const eventTarget = new EventTarget();
  const xhr = new XMLHttpRequest();

  xhr.open(opts.method || 'GET', url, true);
  for (var k in opts.headers) {
    xhr.setRequestHeader(k, opts.headers[k]);
  }

  var ongoing = false, start = 0;
  xhr.onprogress = function () {
    if (!ongoing) {
      // onloadstart is sync with `xhr.send`, listeners don't have a chance
      ongoing = true;
      eventTarget.dispatchEvent(new Event('open', {
        status: xhr.status,
        headers: xhr.getAllResponseHeaders(),
        url: xhr.responseUrl,
      }));
    }

    var i, chunk;
    while ((i = xhr.responseText.indexOf('\n\n', start)) >= 0) {
      chunk = xhr.responseText.slice(start, i);
      start = i + 2;
      if (chunk.length) {
        eventTarget.dispatchEvent(sseevent(chunk));
      }
    }
  }

  xhr.onloadend = _ => {
    eventTarget.dispatchEvent(new CloseEvent('close'))
  }

  xhr.timeout = opts.timeout;
  xhr.ontimeout = _ => {
    eventTarget.dispatchEvent(new CloseEvent('error', { reason: 'Network request timed out' }));
  }
  xhr.onerror = _ => {
    eventTarget.dispatchEvent(new CloseEvent('error', { reason: xhr.responseText || 'Network request failed' }));
  }
  xhr.onabort = _ => {
    eventTarget.dispatchEvent(new CloseEvent('error', { reason: 'Network request aborted' }));
  }

  eventTarget.close = _ => {
    xhr.abort();
  }

  xhr.send(opts.body);
  return eventTarget;
}

function ModalDownload({ open, setClipsDownload, selectedClips }) {
  const [opened, setOpened] = useState(open || false);
  const [downloading, setDownloading] = useState(false);

  const [modalState, setModalState] = useState("clips");
  const [progresses, setProgresses] = useState({});
  const [processed, setProcessed] = useState(0);

  useEffect(() => {
    setOpened(open);
    resetStates();
  }, [opened, open]);

  const resetStates = () => {
    let _p = {};
    for (const clip of selectedClips) {
      _p[clip.id] = "Ready";
    }
    setProgresses(_p);
    setProcessed(0);
    setModalState("clips");
  }

  const downloadClips = () => {
    resetStates();
    setDownloading(true);

    const xs = XhrSource('/api/download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(selectedClips)
    });

    xs.addEventListener('error', e => {
      console.error(e);
      // setDownloading(false);
    });

    xs.addEventListener('close', e => {
      console.log("Connection closed");
      // setDownloading(false);
    });

    xs.addEventListener('message', e => {
      const data = JSON.parse(e.data);
      // console.log(data);

      setModalState(data.type);

      if (data.type === "clips") {
        setProgresses(prev => {
          switch (data.status) {
            case "downloading":
              prev[data.id] = "Downloading";
              break;
            case "success":
              prev[data.id] = "Finished";
              break;
            case "error":
              prev[data.id] = "Error";
              break;
            default:
              prev[data.id] = "Ready";
          }
          return { ...prev };
        })
      } else if (data.type === "compressing") {
        // filter the number of processed clips
        if (data.status === "success") {
          setProcessed(prev => prev + 1);
        }
      } else if (data.type === "final") {
        setDownloading(false);
        // setClipsDownload(false);
      }
    });
  }

  const downloadZip = () => {
    fetch('/api/download', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    }).then(response => {
      setClipsDownload(false);
      return response.blob();
    })
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'clips.zip';
      a.click();
      window.URL.revokeObjectURL(url);
    })
    .catch(error => {
      console.error('Error:', error);
    });
  }

  return (
    <Modal
      open={downloading ? true : opened}
      onClose={() => setClipsDownload(false)}
      className={classes.modal}
    >
      <>
        {
          modalState === "clips" ?
            <DownloadList
              selectedClips={selectedClips}
              downloading={downloading}
              downloadClips={downloadClips}
              progresses={progresses}
            />
            : null
        }
        {
          modalState === "compressing" ?
            <CompressingList
              processed={processed}
              maxProcessed={selectedClips.length}
            />
            : null
        }
        {
          modalState === "final" ?
            <div className={classes.modalContent}>
              <h1 className={classes.text}>Download finished</h1>
              <Button
                variant="contained"
                onClick={downloadZip}
                className={classes.downloadButton}
              >
                Download zip
              </Button>
            </div>
            : null
        }
      </>
    </Modal>
  )
}

function CompressingList({ processed, maxProcessed }) {
  return (
    <div className={classes.compressingModalContent}>
      <h1 className={classes.text}>Compressing clips...</h1>
      <LinearProgress
        variant="determinate"
        color="primary"
        className={classes.progress}
        value={Math.floor((processed / maxProcessed) * 100)}
      />
    </div>
  )
}

function DownloadList({ selectedClips, downloading, downloadClips, progresses }) {

  return (
    <div className={classes.modalContent}>
      <List className={classes.list}>
        {selectedClips.map((clip) => (
          <DownloadItem key={clip.id} _p={progresses[clip.id]} clip={clip} />
        ))}
      </List>

      <Button
        variant="contained"
        onClick={downloadClips}
        startIcon={<Download />}
        disabled={downloading}
        className={classes.downloadButton}
      >
        Start download
      </Button>
    </div>
  )
}

function DownloadItem({ _p, clip }) {
  const [progress, setProgress] = useState(_p || "Ready");

  useEffect(() => {
    setProgress(_p);
    // focus on the item
    if (_p === "Downloading") {
      document.getElementById(clip.id).scrollIntoView({ behavior: "smooth" });
    }
  }, [_p, progress]);

  return (
    <div id={clip.id} className={classes.listItem}>
      <span className={classes.text}>{clip.title}</span>
      <span className={classes.status}>{progress}</span>
      {progress === "Downloading" ? <LinearProgress className={classes.progress} /> : null}
      {progress === "Ready" ? <LinearProgress className={classes.progress} variant="determinate" value={0} color="error" /> : null}
      {progress === "Finished" ? <LinearProgress className={classes.progress} color="success" variant="determinate" value={100} /> : null}
    </div>
  )
}

export default ModalDownload;
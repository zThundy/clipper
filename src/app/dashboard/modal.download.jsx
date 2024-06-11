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
  const [progresses, setProgresses] = useState({});
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    resetStates();
    // if (open) downloadClips();
    setOpened(open);
  }, [opened, open]);

  const resetStates = () => {
    let _p = {};
    for (const clip of selectedClips) {
      _p[clip.id] = "Ready";
    }
    setProgresses(_p);
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
      setDownloading(false);
    });

    xs.addEventListener('close', e => {
      console.log("Connection closed");
      setDownloading(false);
    });

    xs.addEventListener('message', e => {
      const data = JSON.parse(e.data);
      // console.log(data);

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
        console.log(prev);
        return { ...prev };
      })
    });
  }

  return (
    <Modal
      open={downloading ? true : opened}
      onClose={() => setClipsDownload(false)}
      className={classes.modal}
    >

      <div className={classes.modalContent}>
        <List className={classes.list}>
          {selectedClips.map((clip) => (
            <DownloadItem key={clip.id} _p={progresses[clip.id]} clip={clip} />
          ))}
        </List>

        <Button
          variant="contained"
          color="primary"
          onClick={downloadClips}
          startIcon={<Download />}
          disableElevation
          disabled={downloading}
          className={classes.downloadButton}
        >
          Start download
        </Button>
      </div>

    </Modal>
  )
}

function DownloadItem({ _p, clip }) {
  const [progress, setProgress] = useState(_p || "Ready");

  useEffect(() => {
    console.log("DownloadItem progress", _p, progress);
    setProgress(_p);
  }, [_p, progress]);

  return (
    <div key={clip.id} className={classes.listItem}>
      <span className={classes.text}>{clip.title}</span>
      <span className={classes.status}>{progress}</span>
      {progress === "Downloading" ? <LinearProgress className={classes.progress} /> : null}
      {progress === "Ready" ? <LinearProgress className={classes.progress} variant="determinate" value={0} color="error" /> : null}
      {progress === "Finished" ? <LinearProgress className={classes.progress} color="success" variant="determinate" value={100} /> : null}
    </div>
  )
}

export default ModalDownload;
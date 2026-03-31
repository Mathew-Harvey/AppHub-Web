import { useState, useEffect, useRef, useCallback } from 'react';

const VIDEO_ID = '8oMSPyDa0ug';

export default function EasterEgg() {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const playerRef = useRef(null);
  const containerRef = useRef(null);

  const close = useCallback(() => {
    setClosing(true);
    setTimeout(() => {
      setOpen(false);
      setClosing(false);
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    }, 400);
  }, []);

  useEffect(() => {
    if (!open || closing) return;

    let cancelled = false;

    const initPlayer = () => {
      if (cancelled || !containerRef.current) return;
      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId: VIDEO_ID,
        playerVars: {
          autoplay: 1,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          playsinline: 1,
        },
        events: {
          onStateChange: (e) => {
            if (e.data === window.YT.PlayerState.ENDED) close();
          },
        },
      });
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(tag);
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      cancelled = true;
    };
  }, [open, closing, close]);

  if (!open) {
    return (
      <button className="easter-egg-trigger" onClick={() => setOpen(true)}>
        Overwhelmed?
      </button>
    );
  }

  return (
    <div
      className={`easter-egg-overlay ${closing ? 'easter-egg-out' : ''}`}
      onClick={close}
    >
      <div className="easter-egg-modal" onClick={(e) => e.stopPropagation()}>
        <div className="easter-egg-player" ref={containerRef} />
      </div>
    </div>
  );
}

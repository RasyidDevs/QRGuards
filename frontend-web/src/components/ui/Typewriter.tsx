import { useEffect, useState } from "react";

export default function Typewriter({
  text,
  speed = 70,
  deleteSpeed = 35,
  pause = 2000,
}) {
  const [displayed, setDisplayed] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(
      () => {
        if (!deleting) {
          if (displayed.length < text.length) {
            setDisplayed(text.slice(0, displayed.length + 1));
          } else {
            setDeleting(true);
          }
        } else {
          if (displayed.length > 0) {
            setDisplayed(text.slice(0, displayed.length - 1));
          } else {
            setDeleting(false);
          }
        }
      },
      deleting ? deleteSpeed : displayed.length === text.length ? pause : speed,
    );

    return () => clearTimeout(timeout);
  }, [displayed, deleting, text, speed, deleteSpeed, pause]);

  return (
    <span>
      {displayed}

      <span className="text-accent animate-pulse">|</span>
    </span>
  );
}

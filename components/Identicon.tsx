import { accentForId, identiconFor } from "@/lib/swender";

/**
 * Avatar fallback with a native explanation: no photo means you get the
 * identicon your commits already have.
 */
export function Identicon({
  id,
  className = "",
}: {
  id: string;
  className?: string;
}) {
  const grid = identiconFor(id);
  const color = accentForId(id);
  return (
    <svg
      viewBox="0 0 7 7"
      shapeRendering="crispEdges"
      aria-hidden
      className={className}
    >
      {grid.map((row, y) =>
        row.map((on, x) =>
          on ? (
            <rect
              key={`${x}-${y}`}
              x={x + 1}
              y={y + 1}
              width="1"
              height="1"
              fill={color}
              opacity={0.85}
            />
          ) : null,
        ),
      )}
    </svg>
  );
}

/** Square avatar: photo if there is one, identicon if there isn't. */
export function Avatar({
  id,
  name,
  src,
  size = 40,
  className = "",
}: {
  id: string;
  name: string;
  src?: string;
  size?: number;
  className?: string;
}) {
  return (
    <span
      style={{ width: size, height: size }}
      className={`relative shrink-0 overflow-hidden rounded-sm bg-inset outline outline-white/10 -outline-offset-1 ${className}`}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={name}
          draggable={false}
          className="h-full w-full object-cover"
        />
      ) : (
        <Identicon id={id} className="h-full w-full" />
      )}
    </span>
  );
}

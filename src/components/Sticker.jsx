import { useState, useEffect, useRef } from 'react';

const COLORS = {
  yellow: '#ffeaa7',
  pink: '#fab1a0',
  blue: '#74b9ff',
  green: '#55efc4',
  purple: '#a29bfe',
  orange: '#feca57'
};

const Sticker = ({ 
  type = 'postit',
  href = '#',
  title = 'Untitled',
  description,
  date,
  tags,
  color = 'yellow',
  icon,
  size,
  x,
  y,
  rotation
}) => {
  const [position, setPosition] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [svgContent, setSvgContent] = useState(null);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const dragStartOffset = useRef({ x: 0, y: 0 });
  const hasMoved = useRef(false);

  // Load external SVG if it's a path (starts with / or http)
  useEffect(() => {
    if (type === 'svg' && icon && typeof icon === 'string') {
      // Check if it's a URL/path or raw SVG content
      if (icon.startsWith('/') || icon.startsWith('http')) {
        // It's a path, fetch it
        fetch(icon)
          .then(res => res.text())
          .then(svg => setSvgContent(svg))
          .catch(err => console.error('Failed to load SVG:', err));
      } else if (icon.includes('<svg')) {
        // It's already raw SVG content
        setSvgContent(icon);
      }
    }
  }, [icon, type]);

  // Initialize position only on client side
  useEffect(() => {
    // Convert rem units to pixels (1rem = 16px by default)
    const remToPx = (rem) => rem * 16;
    
    // Use explicit x/y if provided, otherwise random
    const initialX = x !== undefined ? remToPx(x) : Math.random() * (window.innerWidth - 300);
    const initialY = y !== undefined ? remToPx(y) : Math.random() * (window.innerHeight - 300);
    
    // Use explicit size if provided (in rem), otherwise random scale
    const initialScale = size !== undefined ? size / 10 : 0.7 + Math.random() * 0.6;
    
    // Use explicit rotation if provided, otherwise random
    const initialRotation = rotation !== undefined ? rotation : -8 + Math.random() * 16;
    
    setPosition({
      x: initialX,
      y: initialY,
      scale: initialScale,
      rotation: initialRotation
    });
  }, [x, y, size, rotation]);

  const handlePointerDown = (e) => {
    if (!position) return;
    
    e.preventDefault();
    
    setIsDragging(true);
    hasMoved.current = false;
    
    dragStartPos.current = {
      x: e.clientX,
      y: e.clientY
    };
    
    dragStartOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
  };

  const handlePointerMove = (e) => {
    if (!isDragging || !position) return;
    
    const deltaX = Math.abs(e.clientX - dragStartPos.current.x);
    const deltaY = Math.abs(e.clientY - dragStartPos.current.y);
    
    if (deltaX > 5 || deltaY > 5) {
      hasMoved.current = true;
    }
    
    const newX = e.clientX - dragStartOffset.current.x;
    const newY = e.clientY - dragStartOffset.current.y;

    setPosition(prev => ({
      ...prev,
      x: newX,
      y: newY
    }));
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const handleClick = (e) => {
    if (hasMoved.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
      
      return () => {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
      };
    }
  }, [isDragging, position]);

  if (!position) return null;

  const containerStyle = {
    position: 'absolute',
    left: `${position.x}px`,
    top: `${position.y}px`,
    transform: `rotate(${position.rotation}deg) scale(${position.scale})`,
    transformOrigin: 'center center',
    cursor: isDragging ? 'grabbing' : 'grab',
    userSelect: 'none',
    touchAction: 'none',
    zIndex: isDragging ? 9999 : 1
  };

  if (type === 'svg') {
    return (
      <>
        <style>{`
          .svg-sticker-wrapper {
            transition: transform 0.2s ease, box-shadow 0.2s ease;
          }

          .svg-sticker-wrapper:hover {
            transform: scale(1.05) translateY(-2px);
          }

          .svg-sticker-wrapper.dragging {
            transition: none;
          }

          .svg-sticker {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 150px;
            height: 150px;
            text-decoration: none;
            filter: drop-shadow(0 4px 8px rgba(0,0,0,0.15)) 
                    drop-shadow(0 10px 20px rgba(0,0,0,0.1));
          }

          .svg-sticker svg,
          .svg-sticker img {
            width: 100px;
            height: 100px;
            pointer-events: none;
          }
          
          .svg-sticker svg * {
            stroke: white !important;
            stroke-width: 8 !important;
            stroke-linejoin: round !important;
            stroke-linecap: round !important;
            paint-order: stroke fill !important;
          }

          .svg-sticker-wrapper:hover .svg-sticker {
            filter: drop-shadow(0 8px 16px rgba(0,0,0,0.2)) 
                    drop-shadow(0 15px 30px rgba(0,0,0,0.15));
          }

          .svg-sticker-wrapper.dragging .svg-sticker {
            filter: drop-shadow(0 12px 24px rgba(0,0,0,0.25)) 
                    drop-shadow(0 20px 40px rgba(0,0,0,0.3));
          }
        `}</style>
        <div 
          style={containerStyle}
          onPointerDown={handlePointerDown}
          className={`svg-sticker-wrapper ${isDragging ? 'dragging' : ''}`}
        >
          <a 
            href={href} 
            className="svg-sticker" 
            title={title}
            onClick={handleClick}
          >
            {svgContent ? (
              <div dangerouslySetInnerHTML={{ __html: svgContent }} />
            ) : icon && typeof icon === 'string' ? (
              <img src={icon} alt={title} />
            ) : (
              icon
            )}
          </a>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`
        .postit-wrapper {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .postit-wrapper:hover {
          transform: scale(1.05) translateY(-2px);
        }

        .postit-wrapper.dragging {
          transition: none;
        }

        .postit {
          background: var(--postit-color);
          padding: 20px;
          min-height: 150px;
          width: 200px;
          box-shadow: 
            0 4px 6px rgba(0,0,0,0.1),
            0 10px 20px rgba(0,0,0,0.15);
          text-decoration: none;
          display: block;
          color: #2d3436;
          border-radius: 2px;
          position: relative;
        }

        /* Grain texture on post-its */
        .postit::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.5' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
          opacity: 0.5;
          pointer-events: none;
          border-radius: 2px;
          mix-blend-mode: overlay;
        }

        .postit::before {
          content: '';
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 60px;
          height: 20px;
          background: rgba(0,0,0,0.1);
          border-radius: 0 0 10px 10px;
          pointer-events: none;
        }

        .postit-wrapper:hover .postit {
          box-shadow: 
            0 8px 12px rgba(0,0,0,0.15),
            0 15px 30px rgba(0,0,0,0.2);
        }

        .postit-wrapper.dragging .postit {
          box-shadow: 
            0 12px 24px rgba(0,0,0,0.2),
            0 20px 40px rgba(0,0,0,0.25);
        }

        .postit h3 {
          margin: 25px 0 10px 0;
          font-size: 1.3rem;
          color: inherit;
          pointer-events: none;
        }

        .postit p {
          font-size: 0.9rem;
          line-height: 1.4;
          margin: 5px 0;
          color: #555;
          pointer-events: none;
        }

        .tag {
          display: inline-block;
          background: rgba(255,255,255,0.5);
          padding: 2px 6px;
          border-radius: 3px;
          font-size: 0.7rem;
          margin-right: 4px;
          margin-top: 4px;
          pointer-events: none;
        }
      `}</style>
      <div 
        style={containerStyle}
        onPointerDown={handlePointerDown}
        className={`postit-wrapper ${isDragging ? 'dragging' : ''}`}
      >
        <a
          href={href}
          className="postit"
          style={{ '--postit-color': COLORS[color] }}
          onClick={handleClick}
        >
          <h3>{title}</h3>
          {description && <p>{description}</p>}
          {date && (
            <p style={{ fontSize: '0.75rem', color: '#888' }}>
              📅 {date}
            </p>
          )}
          {tags && tags.length > 0 && (
            <div>
              {tags.slice(0, 3).map((tag, i) => (
                <span key={i} className="tag">{tag}</span>
              ))}
            </div>
          )}
        </a>
      </div>
    </>
  );
};

export default Sticker;
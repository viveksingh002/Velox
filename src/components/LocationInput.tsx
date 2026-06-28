'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface Suggestion {
  display_name: string
  lat: string
  lon: string
}

interface LocationInputProps {
  placeholder: string
  value: string
  onChange: (value: string, lat?: number, lng?: number) => void
  disabled?: boolean
  icon?: 'pickup' | 'drop'
}

export default function LocationInput({
  placeholder,
  value,
  onChange,
  disabled = false,
  icon = 'pickup',
}: LocationInputProps) {
  const [query, setQuery] = useState(value || '')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const wrapRef = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Sync external value
  useEffect(() => {
    if (value !== query) setQuery(value)
  }, [value])

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 3) { setSuggestions([]); setOpen(false); return }
    setLoading(true)
    try {
      const res = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=5&lang=en`
      )
      const data = await res.json()
      const results: Suggestion[] = (data.features || []).map((f: any) => ({
        display_name: [
          f.properties.name,
          f.properties.city || f.properties.town || f.properties.village,
          f.properties.state,
          f.properties.country,
        ].filter(Boolean).join(', '),
        lat: String(f.geometry.coordinates[1]),
        lon: String(f.geometry.coordinates[0]),
      }))
      setSuggestions(results)
      setOpen(results.length > 0)
    } catch {
      setSuggestions([])
    } finally {
      setLoading(false)
    }
  }, [])

  const handleInput = (val: string) => {
    setQuery(val)
    setSelected(false)
    onChange(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 320)
  }

  const handleSelect = (s: Suggestion) => {
    setQuery(s.display_name)
    setSelected(true)
    setOpen(false)
    setSuggestions([])
    onChange(s.display_name, parseFloat(s.lat), parseFloat(s.lon))
  }

  const handleClear = () => {
    setQuery('')
    setSelected(false)
    setSuggestions([])
    setOpen(false)
    onChange('', undefined, undefined)
  }

  return (
    <>
      <style>{`
        .li-wrap { position: relative; width: 100%; }

        .li-field {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 13px 16px;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 14px;
          background: rgba(255,255,255,0.04);
          transition: all 0.2s;
          cursor: text;
        }
        .li-field:focus-within {
          border-color: rgba(0,113,227,0.55);
          background: rgba(0,113,227,0.05);
          box-shadow: 0 0 0 3px rgba(0,113,227,0.1);
        }
        .li-field.disabled {
          opacity: 0.45;
          cursor: not-allowed;
          pointer-events: none;
        }
        .li-field.has-value {
          border-color: rgba(0,113,227,0.3);
        }

        .li-dot {
          width: 10px; height: 10px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .li-dot.pickup { background: #0071e3; box-shadow: 0 0 8px rgba(0,113,227,0.6); }
        .li-dot.drop   { background: #5ac8fa; box-shadow: 0 0 8px rgba(90,200,250,0.6); }

        .li-input {
          flex: 1;
          background: none;
          border: none;
          outline: none;
          font-size: 14px;
          color: #fff;
          font-family: 'Inter', sans-serif;
          -webkit-text-fill-color: #fff;
          min-width: 0;
        }
        .li-input::placeholder { color: rgba(255,255,255,0.25); }
        .li-input:disabled { cursor: not-allowed; }

        .li-clear {
          width: 20px; height: 20px;
          border-radius: 50%;
          background: rgba(255,255,255,0.1);
          border: none;
          color: rgba(255,255,255,0.5);
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          transition: all 0.15s;
          padding: 0;
        }
        .li-clear:hover { background: rgba(255,255,255,0.18); color: #fff; }

        .li-spinner {
          width: 14px; height: 14px;
          border: 1.5px solid rgba(255,255,255,0.15);
          border-top-color: #0071e3;
          border-radius: 50%;
          animation: liSpin 0.6s linear infinite;
          flex-shrink: 0;
        }
        @keyframes liSpin { to { transform: rotate(360deg); } }

        /* Dropdown */
        .li-dropdown {
          position: absolute;
          top: calc(100% + 6px);
          left: 0; right: 0;
          background: rgba(14,14,26,0.98);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 14px;
          overflow: hidden;
          z-index: 9999;
          box-shadow: 0 16px 48px rgba(0,0,0,0.5);
          backdrop-filter: blur(20px);
        }

        .li-option {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 11px 14px;
          cursor: pointer;
          transition: background 0.15s;
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }
        .li-option:last-child { border-bottom: none; }
        .li-option:hover { background: rgba(0,113,227,0.1); }

        .li-option-icon {
          color: rgba(255,255,255,0.25);
          flex-shrink: 0;
          margin-top: 1px;
        }
        .li-option-text {
          font-size: 13px;
          color: rgba(255,255,255,0.8);
          line-height: 1.4;
          font-family: 'Inter', sans-serif;
        }
      `}</style>

      <div className="li-wrap" ref={wrapRef}>
        <div className={`li-field ${disabled ? 'disabled' : ''} ${selected ? 'has-value' : ''}`}>
          <div className={`li-dot ${icon}`} />

          <input
            className="li-input"
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => handleInput(e.target.value)}
            onFocus={() => suggestions.length > 0 && setOpen(true)}
            disabled={disabled}
            autoComplete="off"
          />

          {loading && <div className="li-spinner" />}

          {query && !loading && (
            <button className="li-clear" onClick={handleClear} type="button">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          )}
        </div>

        {open && suggestions.length > 0 && (
          <div className="li-dropdown">
            {suggestions.map((s, i) => (
              <div key={i} className="li-option" onClick={() => handleSelect(s)}>
                <span className="li-option-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                    <circle cx="12" cy="9" r="2.5"/>
                  </svg>
                </span>
                <span className="li-option-text">{s.display_name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
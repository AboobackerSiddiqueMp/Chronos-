import React, { useState, useEffect } from 'react';
import { Globe, Plus, Trash2, Clock as ClockIcon } from 'lucide-react';
import { WorldClockItem } from '../types';

export const ClockView: React.FC = () => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [is24Hour, setIs24Hour] = useState<boolean>(false);
  const [showAnalog, setShowAnalog] = useState<boolean>(false);

  const [worldClocks, setWorldClocks] = useState<WorldClockItem[]>([
    { id: '1', city: 'London', timeZone: 'Europe/London' },
    { id: '2', city: 'New York', timeZone: 'America/New_York' },
    { id: '3', city: 'Tokyo', timeZone: 'Asia/Tokyo' },
    { id: '4', city: 'Dubai', timeZone: 'Asia/Dubai' },
  ]);

  const [newCityName, setNewCityName] = useState('');
  const [newTimeZone, setNewTimeZone] = useState('America/Los_Angeles');
  const [isAddingCity, setIsAddingCity] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatHours = (date: Date, tz?: string) => {
    const options: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      hour12: !is24Hour,
      timeZone: tz,
    };
    const formatted = new Intl.DateTimeFormat('en-US', options).format(date);
    return formatted.replace(/\s*[AP]M/i, '').padStart(2, '0');
  };

  const formatMinutes = (date: Date, tz?: string) => {
    const options: Intl.DateTimeFormatOptions = {
      minute: '2-digit',
      timeZone: tz,
    };
    return new Intl.DateTimeFormat('en-US', options).format(date);
  };

  const formatSeconds = (date: Date, tz?: string) => {
    const options: Intl.DateTimeFormatOptions = {
      second: '2-digit',
      timeZone: tz,
    };
    return new Intl.DateTimeFormat('en-US', options).format(date);
  };

  const getAmPm = (date: Date, tz?: string) => {
    if (is24Hour) return '';
    const options: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      hour12: true,
      timeZone: tz,
    };
    const formatted = new Intl.DateTimeFormat('en-US', options).format(date);
    return formatted.includes('PM') ? 'PM' : 'AM';
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getTimeZoneName = () => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone.replace('_', ' ');
    } catch {
      return 'Local Time';
    }
  };

  const handleAddWorldClock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCityName.trim()) return;
    setWorldClocks([
      ...worldClocks,
      {
        id: Date.now().toString(),
        city: newCityName.trim(),
        timeZone: newTimeZone,
      },
    ]);
    setNewCityName('');
    setIsAddingCity(false);
  };

  const handleRemoveCity = (id: string) => {
    setWorldClocks(worldClocks.filter((c) => c.id !== id));
  };

  // Analog clock hand angles
  const sec = currentTime.getSeconds();
  const min = currentTime.getMinutes();
  const hr = currentTime.getHours() % 12;
  const secAngle = sec * 6;
  const minAngle = min * 6 + sec * 0.1;
  const hrAngle = hr * 30 + min * 0.5;

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[70vh] px-4 py-8 select-none">
      {/* Subtitle / Mode Label */}
      <div className="flex items-center justify-center gap-2 text-neutral-400 text-xs sm:text-sm uppercase tracking-[0.3em] font-light mb-10 sm:mb-14">
        <ClockIcon className="w-4 h-4 stroke-[1.5]" />
        <span>CURRENT LOCAL TIME</span>
      </div>

      {showAnalog ? (
        /* Minimalist Analog Clock View */
        <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-full border border-neutral-800 bg-neutral-950 flex items-center justify-center mb-10 shadow-2xl">
          {/* Hour markers */}
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-3 bg-neutral-600 rounded-full"
              style={{
                transform: `rotate(${i * 30}deg) translateY(-118px)`,
                transformOrigin: 'center center',
              }}
            />
          ))}

          {/* Hour Hand */}
          <div
            className="absolute w-1.5 h-20 bg-white rounded-full origin-bottom"
            style={{
              bottom: '50%',
              transform: `rotate(${hrAngle}deg)`,
              transition: 'transform 0.05s linear',
            }}
          />

          {/* Minute Hand */}
          <div
            className="absolute w-1 h-28 bg-neutral-300 rounded-full origin-bottom"
            style={{
              bottom: '50%',
              transform: `rotate(${minAngle}deg)`,
              transition: 'transform 0.05s linear',
            }}
          />

          {/* Second Hand */}
          <div
            className="absolute w-0.5 h-32 bg-red-400 rounded-full origin-bottom"
            style={{
              bottom: '50%',
              transform: `rotate(${secAngle}deg)`,
              transition: 'transform 0.05s linear',
            }}
          />

          {/* Center Pin */}
          <div className="absolute w-3 h-3 bg-white rounded-full z-10 shadow" />
        </div>
      ) : (
        /* Digital Giant Display Matching Design System */
        <div className="flex items-center justify-center gap-2 sm:gap-6 md:gap-8 lg:gap-12 w-full mb-10 max-w-5xl">
          {/* HOURS */}
          <div className="flex flex-col items-center flex-1 min-w-[100px] max-w-[280px] lg:max-w-[320px]">
            <span className="timer-number-display text-8xl sm:text-9xl md:text-[145px] lg:text-[175px] font-normal tracking-wide text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.15)] block py-1 leading-none">
              {formatHours(currentTime)}
            </span>
            <div className="w-full h-[1.5px] sm:h-[2px] bg-[#222222] my-4" />
            <span className="text-[11px] sm:text-xs tracking-[0.32em] uppercase text-neutral-500 font-medium">
              HOURS
            </span>
          </div>

          {/* COLON 1 */}
          <div className="flex flex-col items-center justify-center gap-3 sm:gap-4 pb-8 sm:pb-12 px-1 sm:px-2">
            <span className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 rounded-full bg-white/80 animate-pulse" />
            <span className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 rounded-full bg-white/80 animate-pulse" />
          </div>

          {/* MINUTES */}
          <div className="flex flex-col items-center flex-1 min-w-[100px] max-w-[280px] lg:max-w-[320px]">
            <span className="timer-number-display text-8xl sm:text-9xl md:text-[145px] lg:text-[175px] font-normal tracking-wide text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.15)] block py-1 leading-none">
              {formatMinutes(currentTime)}
            </span>
            <div className="w-full h-[1.5px] sm:h-[2px] bg-[#222222] my-4" />
            <span className="text-[11px] sm:text-xs tracking-[0.32em] uppercase text-neutral-500 font-medium">
              MINUTES
            </span>
          </div>

          {/* COLON 2 */}
          <div className="flex flex-col items-center justify-center gap-3 sm:gap-4 pb-8 sm:pb-12 px-1 sm:px-2">
            <span className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 rounded-full bg-white/80 animate-pulse" />
            <span className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 rounded-full bg-white/80 animate-pulse" />
          </div>

          {/* SECONDS */}
          <div className="flex flex-col items-center flex-1 min-w-[100px] max-w-[280px] lg:max-w-[320px]">
            <div className="relative py-1 w-full text-center">
              <span className="timer-number-display text-8xl sm:text-9xl md:text-[145px] lg:text-[175px] font-normal tracking-wide text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.15)] block leading-none">
                {formatSeconds(currentTime)}
              </span>
              {!is24Hour && (
                <span className="absolute -top-2 right-2 sm:right-4 text-xs sm:text-sm font-medium tracking-wider text-neutral-400">
                  {getAmPm(currentTime)}
                </span>
              )}
            </div>
            <div className="w-full h-[1.5px] sm:h-[2px] bg-[#222222] my-4" />
            <span className="text-[11px] sm:text-xs tracking-[0.32em] uppercase text-neutral-500 font-medium">
              SECONDS
            </span>
          </div>
        </div>
      )}

      {/* Date & Timezone Badges */}
      <div className="flex items-center gap-3 text-neutral-400 text-xs sm:text-sm tracking-wide mb-10">
        <span>{formatDate(currentTime)}</span>
        <span className="text-neutral-600">·</span>
        <span className="text-neutral-500">{getTimeZoneName()}</span>
      </div>

      {/* View Options Toggle Controls */}
      <div className="flex items-center gap-3 mb-12">
        <button
          onClick={() => setIs24Hour(!is24Hour)}
          className={`px-4 py-1.5 rounded-full text-xs font-normal border transition-all cursor-pointer ${
            is24Hour
              ? 'border-neutral-500 bg-neutral-800 text-white'
              : 'border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:text-white'
          }`}
        >
          {is24Hour ? '24-Hour Format' : '12-Hour Format'}
        </button>

        <button
          onClick={() => setShowAnalog(!showAnalog)}
          className={`px-4 py-1.5 rounded-full text-xs font-normal border transition-all cursor-pointer ${
            showAnalog
              ? 'border-neutral-500 bg-neutral-800 text-white'
              : 'border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:text-white'
          }`}
        >
          {showAnalog ? 'Digital View' : 'Analog View'}
        </button>
      </div>

      {/* World Clocks Bar */}
      <div className="w-full max-w-2xl border-t border-neutral-800/80 pt-8 mt-2">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-neutral-400 font-medium">
            <Globe className="w-3.5 h-3.5" />
            <span>World Clocks</span>
          </div>
          <button
            onClick={() => setIsAddingCity(!isAddingCity)}
            className="flex items-center gap-1 text-xs text-neutral-400 hover:text-white px-2.5 py-1 rounded-full border border-neutral-800 hover:border-neutral-700 bg-neutral-900/40 transition-colors cursor-pointer"
          >
            <Plus className="w-3 h-3" />
            <span>Add City</span>
          </button>
        </div>

        {/* Add city form */}
        {isAddingCity && (
          <form onSubmit={handleAddWorldClock} className="flex gap-2 mb-4 p-3 bg-neutral-900/80 rounded-xl border border-neutral-800">
            <input
              type="text"
              placeholder="City name (e.g. Sydney, Paris)"
              value={newCityName}
              onChange={(e) => setNewCityName(e.target.value)}
              className="flex-1 bg-black/60 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-neutral-600"
              autoFocus
            />
            <select
              value={newTimeZone}
              onChange={(e) => setNewTimeZone(e.target.value)}
              className="bg-black/60 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-neutral-300 outline-none"
            >
              <option value="America/New_York">New York (UTC-5)</option>
              <option value="America/Los_Angeles">Los Angeles (UTC-8)</option>
              <option value="America/Chicago">Chicago (UTC-6)</option>
              <option value="Europe/London">London (UTC+0)</option>
              <option value="Europe/Paris">Paris (UTC+1)</option>
              <option value="Asia/Tokyo">Tokyo (UTC+9)</option>
              <option value="Asia/Dubai">Dubai (UTC+4)</option>
              <option value="Asia/Singapore">Singapore (UTC+8)</option>
              <option value="Australia/Sydney">Sydney (UTC+11)</option>
            </select>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-white text-black text-xs font-medium hover:bg-neutral-200 cursor-pointer"
            >
              Add
            </button>
          </form>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {worldClocks.map((clock) => (
            <div
              key={clock.id}
              className="group relative flex flex-col p-3 rounded-xl border border-neutral-900 bg-neutral-950/70 hover:border-neutral-800 transition-all"
            >
              <span className="text-xs text-neutral-400 font-medium truncate mb-1">
                {clock.city}
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-light text-white tabular-nums tracking-tight">
                  {formatHours(currentTime, clock.timeZone)}:{formatMinutes(currentTime, clock.timeZone)}
                </span>
                {!is24Hour && (
                  <span className="text-[10px] text-neutral-500 font-medium">
                    {getAmPm(currentTime, clock.timeZone)}
                  </span>
                )}
              </div>
              <button
                onClick={() => handleRemoveCity(clock.id)}
                title="Remove City"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-neutral-500 hover:text-red-400 transition-opacity p-1"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

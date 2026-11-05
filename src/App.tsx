import { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, CalendarDays, CloudSun, Droplets, Heart, MapPin, Search, Wind } from 'lucide-react';

type City = { id: string; name: string; region: string; latitude: number; longitude: number };
type CurrentWeather = { temperature_2m: number; relative_humidity_2m: number; weather_code: number; wind_speed_10m: number; time: string };
type DailyWeather = { time: string[]; weather_code: number[]; temperature_2m_max: number[]; temperature_2m_min: number[] };
type WeatherData = { current: CurrentWeather; daily: DailyWeather };
type Unit = 'C' | 'F';
type WeatherInfo = { description: string; icon: string; tone: string };

const CITIES: City[] = [
  { id: 'hanoi', name: 'Hà Nội', region: 'Miền Bắc', latitude: 21.0285, longitude: 105.8542 },
  { id: 'haiphong', name: 'Hải Phòng', region: 'Miền Bắc', latitude: 20.8449, longitude: 106.6881 },
  { id: 'hue', name: 'Huế', region: 'Miền Trung', latitude: 16.4637, longitude: 107.5909 },
  { id: 'danang', name: 'Đà Nẵng', region: 'Miền Trung', latitude: 16.0544, longitude: 108.2022 },
  { id: 'nhatrang', name: 'Nha Trang', region: 'Miền Trung', latitude: 12.2388, longitude: 109.1967 },
  { id: 'dalat', name: 'Đà Lạt', region: 'Tây Nguyên', latitude: 11.9404, longitude: 108.4583 },
  { id: 'hochiminh', name: 'TP. H��� Chí Minh', region: 'Miền Nam', latitude: 10.8231, longitude: 106.6297 },
  { id: 'cantho', name: 'Cần Thơ', region: 'Miền Nam', latitude: 10.0452, longitude: 105.7469 },
];

function weatherInfo(code: number): WeatherInfo {
  if (code === 0) return { description: 'Trời quang', icon: '☀️', tone: 'sunny' };
  if ([1, 2].includes(code)) return { description: code === 1 ? 'Ít mây' : 'Mây rải rác', icon: '🌤️', tone: 'partly' };
  if (code === 3) return { description: 'Nhiều mây', icon: '☁️', tone: 'cloudy' };
  if ([45, 48].includes(code)) return { description: 'Sương mù', icon: '🌫️', tone: 'cloudy' };
  if ([51, 53, 55, 56, 57].includes(code)) return { description: 'Mưa phùn', icon: '🌦️', tone: 'rainy' };
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return { description: 'Có mưa', icon: '🌧️', tone: 'rainy' };
  if ([71, 73, 75, 77, 85, 86].includes(code)) return { description: 'Có tuyết', icon: '❄️', tone: 'cloudy' };
  if ([95, 96, 99].includes(code)) return { description: 'Dông', icon: '⛈️', tone: 'stormy' };
  return { description: 'Thời tiết ổn định', icon: '🌤️', tone: 'partly' };
}

function toDisplayTemperature(celsius: number, unit: Unit) {
  return Math.round(unit === 'C' ? celsius : celsius * 9 / 5 + 32);
}

function normalize(text: string) {
  return text.toLocaleLowerCase('vi').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd');
}

function formatDate(date: string, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat('vi-VN', options).format(new Date(`${date}T00:00:00`));
}

function App() {
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [unit, setUnit] = useState<Unit>('C');
  const [query, setQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('vietnam-weather-favorites') || '[]') as string[]; }
    catch { return []; }
  });

  const filteredCities = useMemo(() => CITIES.filter((city) => normalize(`${city.name} ${city.region}`).includes(normalize(query))), [query]);

  async function loadCity(city: City) {
    setSelectedCity(city);
    setLoading(true);
    setError('');
    setWeather(null);
    const params = new URLSearchParams({
      latitude: String(city.latitude),
      longitude: String(city.longitude),
      current: 'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m',
      daily: 'weather_code,temperature_2m_max,temperature_2m_min',
      timezone: 'Asia/Ho_Chi_Minh',
      forecast_days: '7',
    });
    try {
      const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`);
      if (!response.ok) throw new Error('Không thể tải dữ liệu thời tiết. Vui lòng thử lại.');
      const data = await response.json() as WeatherData;
      if (!data.current || !data.daily) throw new Error('Dữ liệu thời tiết không hợp lệ. Vui lòng thử lại.');
      setWeather(data);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Đã xảy ra lỗi kết nối. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }

  function toggleFavorite(cityId: string) {
    setFavorites((current) => {
      const next = current.includes(cityId) ? current.filter((id) => id !== cityId) : [...current, cityId];
      localStorage.setItem('vietnam-weather-favorites', JSON.stringify(next));
      return next;
    });
  }

  const currentInfo = weather ? weatherInfo(weather.current.weather_code) : null;

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#" aria-label="Thời tiết Việt Nam, trang chủ">
          <span className="brand-mark"><CloudSun size={21} strokeWidth={2.2} /></span>
          <span className="brand-name">mây<span>.</span></span>
        </a>
        <div className="topbar-right">
          <span className="live-indicator"><i /> Dữ liệu trực tiếp</span>
          <div className="unit-switch" aria-label="Chọn đơn vị nhiệt độ">
            <button className={unit === 'C' ? 'active' : ''} onClick={() => setUnit('C')} aria-pressed={unit === 'C'}>°C</button>
            <button className={unit === 'F' ? 'active' : ''} onClick={() => setUnit('F')} aria-pressed={unit === 'F'}>°F</button>
          </div>
        </div>
      </header>

      <section className="intro">
        <p className="eyebrow">THỜI TIẾT VIỆT NAM</p>
        <h1>Bầu trời hôm nay<br /><span>đang kể câu chuyện gì?</span></h1>
        <p className="intro-copy">Cập nhật thời tiết và dự báo 7 ngày tại những thành phố bạn yêu thích.</p>
      </section>

      <div className="dashboard">
        <aside className="city-panel panel">
          <div className="panel-heading">
            <div><h2>Thành phố</h2><p>Chọn một nơi để khám phá</p></div>
            <span className="city-count">{CITIES.length}</span>
          </div>
          <label className="search-box">
            <Search size={17} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm thành phố..." aria-label="Tìm thành phố" />
            <kbd>⌘ K</kbd>
          </label>
          <div className="city-list">
            {filteredCities.map((city) => {
              const selected = selectedCity?.id === city.id;
              const favorite = favorites.includes(city.id);
              return (
                <div key={city.id} className={`city-row ${selected ? 'selected' : ''}`}>
                  <button className="city-select" onClick={() => void loadCity(city)} aria-pressed={selected}>
                    <span className="city-pin"><MapPin size={16} /></span>
                    <span className="city-copy"><strong>{city.name}</strong><small>{city.region}</small></span>
                    {selected && <span className="selected-dot" />}
                  </button>
                  <button className={`favorite-button ${favorite ? 'favorited' : ''}`} onClick={() => toggleFavorite(city.id)} aria-label={`${favorite ? 'Bỏ yêu thích' : 'Thêm yêu thích'} ${city.name}`} aria-pressed={favorite}>
                    <Heart size={16} fill={favorite ? 'currentColor' : 'none'} />
                  </button>
                </div>
              );
            })}
            {filteredCities.length === 0 && <p className="no-results">Không tìm thấy thành phố phù hợp.</p>}
          </div>
          <div className="source-note"><span className="source-dot" /><span>Dữ liệu bởi <strong>Open-Meteo</strong></span></div>
        </aside>

        <section className="weather-column" aria-live="polite">
          {!selectedCity ? (
            <div className="empty-state panel">
              <div className="empty-illustration">🌤️</div>
              <p className="eyebrow">SẴN SÀNG KHÁM PHÁ</p>
              <h2>Chọn thành phố<br />của bạn</h2>
              <p>Thời tiết hiện tại cùng dự báo 7 ngày sẽ xuất hiện tại đây.</p>
              <span className="empty-hint">← Chọn một thành phố từ danh sách</span>
            </div>
          ) : loading ? (
            <div className="loading-state panel">
              <span className="loader" />
              <h2>Đang xem bầu trời...</h2>
              <p>Đang tải dữ liệu thời tiết tại {selectedCity.name}</p>
              <div className="skeleton-line" /><div className="skeleton-line short" />
            </div>
          ) : error ? (
            <div className="error-state panel">
              <span className="error-icon">!</span>
              <p className="eyebrow">KHÔNG THỂ KẾT NỐI</p>
              <h2>Chưa lấy được<br />dữ liệu thời tiết</h2>
              <p>{error}</p>
              <button className="retry-button" onClick={() => void loadCity(selectedCity)}>Thử lại <span>↻</span></button>
            </div>
          ) : weather && currentInfo ? (
            <>
              <article className={`current-card ${currentInfo.tone}`}>
                <div className="current-topline"><span><MapPin size={15} /> {selectedCity.name}, Việt Nam</span><span className="today-pill">HÔM NAY</span></div>
                <div className="current-main">
                  <div className="current-temp-block">
                    <p className="current-description">{currentInfo.description}</p>
                    <div className="current-temperature">{toDisplayTemperature(weather.current.temperature_2m, unit)}<span>°{unit}</span></div>
                    <p className="feels-note">Thời tiết hiện tại</p>
                  </div>
                  <div className="weather-emoji" aria-label={currentInfo.description}>{currentInfo.icon}</div>
                </div>
                <div className="current-metrics">
                  <div className="metric"><span className="metric-icon"><Droplets size={17} /></span><span><small>Độ ẩm</small><strong>{weather.current.relative_humidity_2m}<em>%</em></strong></span></div>
                  <div className="metric"><span className="metric-icon"><Wind size={17} /></span><span><small>Tốc độ gió</small><strong>{Math.round(weather.current.wind_speed_10m)}<em> km/h</em></strong></span></div>
                  <div className="metric updated"><span className="metric-icon"><CalendarDays size={17} /></span><span><small>Cập nhật lúc</small><strong>{weather.current.time.replace('T', ' ')}</strong></span></div>
                </div>
                <span className="card-orb orb-one" /><span className="card-orb orb-two" />
              </article>

              <section className="forecast-card panel">
                <div className="forecast-heading"><div><p className="eyebrow">NHÌN TRƯỚC</p><h2>Dự báo 7 ngày</h2></div><span className="forecast-range">{formatDate(weather.daily.time[0], { day: 'numeric', month: 'short' })} — {formatDate(weather.daily.time[6], { day: 'numeric', month: 'short' })}</span></div>
                <div className="forecast-list">
                  {weather.daily.time.map((date, index) => {
                    const info = weatherInfo(weather.daily.weather_code[index]);
                    return <div className={`forecast-row ${index === 0 ? 'forecast-today' : ''}`} key={date}>
                      <div className="forecast-date"><strong>{index === 0 ? 'Hôm nay' : formatDate(date, { weekday: 'short' })}</strong><small>{formatDate(date, { day: 'numeric', month: 'short' })}</small></div>
                      <span className="forecast-icon" title={info.description}>{info.icon}</span>
                      <span className="forecast-condition">{info.description}</span>
                      <div className="forecast-temperatures"><strong><ArrowUp size={13} />{toDisplayTemperature(weather.daily.temperature_2m_max[index], unit)}°</strong><span><ArrowDown size={13} />{toDisplayTemperature(weather.daily.temperature_2m_min[index], unit)}°</span></div>
                    </div>;
                  })}
                </div>
                <p className="forecast-footnote">Nhiệt độ cao nhất <ArrowUp size={12} /> và thấp nhất <ArrowDown size={12} /> trong ngày</p>
              </section>
            </>
          ) : null}
        </section>
      </div>
      <footer className="footer"><span>Được thiết kế với ☁️ tại Việt Nam</span><span>Thời tiết có thể thay đổi nhanh chóng</span></footer>
    </main>
  );
}

export default App;

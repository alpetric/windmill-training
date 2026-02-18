import React from 'react';

export default function App() {
  return (
    <div className="container">
      <div className="header">
        <h1>Demo Provisioner Architecture</h1>
        <p>System components and data flow for the Windmill demo environment provisioning system</p>
      </div>

      <div className="diagram">
        <svg viewBox="0 0 700 500" className="diagram-svg">
          <defs>
            <marker id="arrow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#64748b" />
            </marker>
            <marker id="arrow-blue" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
            </marker>
          </defs>

          {/* Row 1: User */}
          <g transform="translate(280, 20)">
            <rect width="140" height="70" rx="8" fill="#fffbeb" stroke="#f59e0b" strokeWidth="2" />
            <text x="70" y="30" textAnchor="middle" fontSize="20">👤</text>
            <text x="70" y="52" textAnchor="middle" fontSize="13" fontWeight="600" fill="#1e293b">User Browser</text>
          </g>

          {/* Arrow: User -> Server */}
          <line x1="350" y1="90" x2="350" y2="130" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow)" />
          <circle cx="320" cy="110" r="12" fill="#3b82f6" />
          <text x="320" y="114" textAnchor="middle" fontSize="11" fontWeight="600" fill="white">1</text>
          <text x="380" y="115" fontSize="11" fill="#64748b">HTTP</text>

          {/* Row 2: Server */}
          <g transform="translate(280, 140)">
            <rect width="140" height="70" rx="8" fill="#eff6ff" stroke="#3b82f6" strokeWidth="2" />
            <text x="70" y="28" textAnchor="middle" fontSize="20">🖥️</text>
            <text x="70" y="46" textAnchor="middle" fontSize="13" fontWeight="600" fill="#1e293b">Windmill Server</text>
            <text x="70" y="60" textAnchor="middle" fontSize="10" fill="#64748b">port 8000</text>
          </g>

          {/* Arrow: Server -> Worker */}
          <line x1="350" y1="210" x2="350" y2="250" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow)" />
          <circle cx="320" cy="230" r="12" fill="#3b82f6" />
          <text x="320" y="234" textAnchor="middle" fontSize="11" fontWeight="600" fill="white">2</text>
          <text x="380" y="235" fontSize="11" fill="#64748b">job queue</text>

          {/* Row 3: Worker */}
          <g transform="translate(280, 260)">
            <rect width="140" height="70" rx="8" fill="#f5f3ff" stroke="#8b5cf6" strokeWidth="2" />
            <text x="70" y="28" textAnchor="middle" fontSize="20">⚙️</text>
            <text x="70" y="46" textAnchor="middle" fontSize="13" fontWeight="600" fill="#1e293b">Windmill Worker</text>
            <text x="70" y="60" textAnchor="middle" fontSize="10" fill="#64748b">default group</text>
          </g>

          {/* Arrow: Worker -> Demo DB */}
          <line x1="280" y1="310" x2="180" y2="380" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow)" />
          <circle cx="210" cy="330" r="12" fill="#3b82f6" />
          <text x="210" y="334" textAnchor="middle" fontSize="11" fontWeight="600" fill="white">3</text>
          <text x="200" y="365" fontSize="11" fill="#64748b">queries</text>

          {/* Arrow: Worker -> Docker */}
          <line x1="420" y1="310" x2="520" y2="380" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow)" />
          <circle cx="490" cy="330" r="12" fill="#3b82f6" />
          <text x="490" y="334" textAnchor="middle" fontSize="11" fontWeight="600" fill="white">4</text>
          <text x="485" y="365" fontSize="11" fill="#64748b">docker API</text>

          {/* Row 4: Demo DB */}
          <g transform="translate(40, 390)">
            <rect width="140" height="70" rx="8" fill="#ecfdf5" stroke="#10b981" strokeWidth="2" />
            <text x="70" y="28" textAnchor="middle" fontSize="20">📊</text>
            <text x="70" y="46" textAnchor="middle" fontSize="13" fontWeight="600" fill="#1e293b">Demo DB</text>
            <text x="70" y="60" textAnchor="middle" fontSize="10" fill="#64748b">PostgreSQL</text>
          </g>

          {/* Row 4: Docker */}
          <g transform="translate(280, 390)">
            <rect width="140" height="70" rx="8" fill="#f0f9ff" stroke="#0ea5e9" strokeWidth="2" />
            <text x="70" y="28" textAnchor="middle" fontSize="20">🐳</text>
            <text x="70" y="46" textAnchor="middle" fontSize="13" fontWeight="600" fill="#1e293b">Docker Engine</text>
            <text x="70" y="60" textAnchor="middle" fontSize="10" fill="#64748b">container runtime</text>
          </g>

          {/* Row 4: Containers */}
          <g transform="translate(520, 390)">
            <rect width="140" height="70" rx="8" fill="#f0f9ff" stroke="#0ea5e9" strokeWidth="2" />
            <text x="70" y="28" textAnchor="middle" fontSize="20">📦</text>
            <text x="70" y="46" textAnchor="middle" fontSize="13" fontWeight="600" fill="#1e293b">Demo Containers</text>
            <text x="70" y="60" textAnchor="middle" fontSize="10" fill="#64748b">Flask apps</text>
          </g>

          {/* Arrow: Docker -> Containers */}
          <line x1="420" y1="425" x2="510" y2="425" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow)" />
          <text x="465" y="418" fontSize="11" fill="#64748b">spawn</text>

          {/* Arrow: Containers -> Server (dashed, curves around right side) */}
          <path
            d="M 660 425 Q 680 425 680 175 Q 680 175 430 175"
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            strokeDasharray="6,4"
            markerEnd="url(#arrow-blue)"
          />
          <circle cx="680" cy="300" r="12" fill="#3b82f6" />
          <text x="680" y="304" textAnchor="middle" fontSize="11" fontWeight="600" fill="white">5</text>
          <text x="640" y="300" fontSize="11" fill="#3b82f6" transform="rotate(-90, 640, 300)">fetch config</text>
        </svg>
      </div>

      {/* Legend */}
      <div className="legend">
        <h3>Component types</h3>
        <div className="legend-grid">
          <div className="legend-item">
            <div className="legend-color server"></div>
            <span className="legend-text">Windmill Server (API/UI)</span>
          </div>
          <div className="legend-item">
            <div className="legend-color worker"></div>
            <span className="legend-text">Windmill Worker (job execution)</span>
          </div>
          <div className="legend-item">
            <div className="legend-color database"></div>
            <span className="legend-text">Demo Database (PostgreSQL)</span>
          </div>
          <div className="legend-item">
            <div className="legend-color docker"></div>
            <span className="legend-text">Docker / Containers</span>
          </div>
        </div>
      </div>

      {/* Data flows */}
      <div className="flows">
        <h3>Data flows</h3>
        <div className="flow-list">
          <div className="flow-item">
            <div className="flow-number">1</div>
            <div className="flow-description">
              <strong>User</strong> <span className="flow-arrow">→</span> <strong>Windmill Server</strong><br/>
              HTTP requests to provision/manage demo environments
            </div>
          </div>
          <div className="flow-item">
            <div className="flow-number">2</div>
            <div className="flow-description">
              <strong>Server</strong> <span className="flow-arrow">→</span> <strong>Worker</strong><br/>
              Job queue dispatches provisioning tasks to workers
            </div>
          </div>
          <div className="flow-item">
            <div className="flow-number">3</div>
            <div className="flow-description">
              <strong>Worker</strong> <span className="flow-arrow">→</span> <strong>Demo DB</strong><br/>
              Query/update demo environment records in data table
            </div>
          </div>
          <div className="flow-item">
            <div className="flow-number">4</div>
            <div className="flow-description">
              <strong>Worker</strong> <span className="flow-arrow">→</span> <strong>Docker</strong><br/>
              Create/destroy demo containers via Docker API
            </div>
          </div>
          <div className="flow-item">
            <div className="flow-number">5</div>
            <div className="flow-description">
              <strong>Demo Containers</strong> <span className="flow-arrow">→</span> <strong>Server</strong><br/>
              Fetch runtime configuration via Windmill API
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

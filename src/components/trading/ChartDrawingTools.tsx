import { useState } from 'react';
import { 
  Minus, 
  TrendingUp,
  Circle,
  Square,
  Type,
  Crosshair,
  BarChart2,
  Smile,
  Eraser,
  RotateCcw,
  RotateCw,
  Maximize2,
  Camera,
  MoreHorizontal,
  GitBranch,
  Layers,
  Ruler,
  PenTool,
  Share2,
  Plus,
  Lock,
  Eye,
  Trash2,
} from 'lucide-react';

type DrawingTool = 
  | 'crosshair'
  | 'trendline'
  | 'horizontalLine'
  | 'verticalLine'
  | 'ray'
  | 'parallelChannel'
  | 'fibRetracement'
  | 'fibExtension'
  | 'rectangle'
  | 'ellipse'
  | 'triangle'
  | 'text'
  | 'arrow'
  | 'brush'
  | 'ruler'
  | 'priceRange'
  | 'dateRange'
  | 'emoji'
  | 'eraser';

interface ChartDrawingToolsProps {
  onToolSelect?: (tool: DrawingTool) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onScreenshot?: () => void;
  onFullscreen?: () => void;
  vertical?: boolean;
}

interface ToolGroup {
  id: string;
  icon: React.ReactNode;
  tools: { id: DrawingTool; label: string; icon?: React.ReactNode }[];
}

const toolGroups: ToolGroup[] = [
  {
    id: 'crosshair',
    icon: <Crosshair size={18} />,
    tools: [{ id: 'crosshair', label: 'Crosshair' }],
  },
  {
    id: 'lines',
    icon: <TrendingUp size={18} />,
    tools: [
      { id: 'trendline', label: 'Trend Line' },
      { id: 'ray', label: 'Ray' },
      { id: 'horizontalLine', label: 'Horizontal Line' },
      { id: 'verticalLine', label: 'Vertical Line' },
      { id: 'parallelChannel', label: 'Parallel Channel' },
    ],
  },
  {
    id: 'fib',
    icon: <GitBranch size={18} />,
    tools: [
      { id: 'fibRetracement', label: 'Fib Retracement' },
      { id: 'fibExtension', label: 'Fib Extension' },
    ],
  },
  {
    id: 'shapes',
    icon: <Square size={18} />,
    tools: [
      { id: 'rectangle', label: 'Rectangle' },
      { id: 'ellipse', label: 'Ellipse' },
      { id: 'triangle', label: 'Triangle' },
    ],
  },
  {
    id: 'patterns',
    icon: <Layers size={18} />,
    tools: [
      { id: 'arrow', label: 'Arrow' },
      { id: 'priceRange', label: 'Price Range' },
      { id: 'dateRange', label: 'Date Range' },
    ],
  },
  {
    id: 'annotation',
    icon: <Type size={18} />,
    tools: [
      { id: 'text', label: 'Text' },
    ],
  },
  {
    id: 'brush',
    icon: <PenTool size={18} />,
    tools: [
      { id: 'brush', label: 'Brush' },
    ],
  },
  {
    id: 'measure',
    icon: <Ruler size={18} />,
    tools: [
      { id: 'ruler', label: 'Measure' },
    ],
  },
  {
    id: 'emoji',
    icon: <Smile size={18} />,
    tools: [
      { id: 'emoji', label: 'Emoji' },
    ],
  },
  {
    id: 'eraser',
    icon: <Eraser size={18} />,
    tools: [
      { id: 'eraser', label: 'Eraser' },
    ],
  },
];

export function ChartDrawingTools({
  onToolSelect,
  onUndo,
  onRedo,
  onScreenshot,
  onFullscreen,
  vertical = true,
}: ChartDrawingToolsProps) {
  const [activeTool, setActiveTool] = useState<DrawingTool>('crosshair');
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  const handleToolClick = (group: ToolGroup) => {
    if (group.tools.length === 1) {
      setActiveTool(group.tools[0].id);
      onToolSelect?.(group.tools[0].id);
    } else {
      setExpandedGroup(expandedGroup === group.id ? null : group.id);
    }
  };

  const handleSubToolClick = (tool: DrawingTool) => {
    setActiveTool(tool);
    onToolSelect?.(tool);
    setExpandedGroup(null);
  };

  const isToolActive = (group: ToolGroup) => {
    return group.tools.some(t => t.id === activeTool);
  };

  return (
    <div className={`chart-drawing-tools ${vertical ? 'vertical' : 'horizontal'}`}>
      {/* Drawing Tools */}
      <div className="drawing-tools-section">
        {toolGroups.map((group) => (
          <div key={group.id} className="drawing-tool-wrapper">
            <button
              className={`drawing-tool-btn ${isToolActive(group) ? 'active' : ''}`}
              onClick={() => handleToolClick(group)}
              title={group.tools[0].label}
            >
              {group.icon}
              {group.tools.length > 1 && (
                <span className="drawing-tool-indicator" />
              )}
            </button>

            {/* Submenu */}
            {expandedGroup === group.id && group.tools.length > 1 && (
              <div className="drawing-tool-submenu">
                {group.tools.map((tool) => (
                  <button
                    key={tool.id}
                    className={`drawing-subtool-btn ${activeTool === tool.id ? 'active' : ''}`}
                    onClick={() => handleSubToolClick(tool.id)}
                  >
                    <span>{tool.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="drawing-tools-divider" />

      {/* Action Buttons */}
      <div className="drawing-tools-actions">
        <button 
          className="drawing-tool-btn" 
          onClick={onUndo}
          title="Undo"
        >
          <RotateCcw size={18} />
        </button>
        <button 
          className="drawing-tool-btn" 
          onClick={onRedo}
          title="Redo"
        >
          <RotateCw size={18} />
        </button>
      </div>

      <div className="drawing-tools-divider" />

      {/* Utility Buttons */}
      <div className="drawing-tools-utility">
        <button 
          className="drawing-tool-btn" 
          onClick={onScreenshot}
          title="Screenshot"
        >
          <Camera size={18} />
        </button>
        <button 
          className="drawing-tool-btn" 
          onClick={onFullscreen}
          title="Fullscreen"
        >
          <Maximize2 size={18} />
        </button>
      </div>

      {/* Bottom spacer for vertical layout */}
      {vertical && (
        <div className="drawing-tools-bottom">
          <button className="drawing-tool-btn" title="More Tools">
            <Plus size={18} />
          </button>
        </div>
      )}
    </div>
  );
}

export default ChartDrawingTools;


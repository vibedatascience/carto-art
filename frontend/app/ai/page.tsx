'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Send, Loader2, Sparkles, MapPin, Palette, Type, Layers, Layout, Download, ArrowLeft, RotateCcw, Wand2, ChevronDown, ChevronUp, Code, Share2, Save, Check, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { MapPreview } from '@/components/map/MapPreview';
import { TextOverlay } from '@/components/map/TextOverlay';
import { applyPaletteToStyle } from '@/lib/styles/applyPalette';
import { applyAIConfig, type AIGeneratedConfig } from '@/lib/ai/applyAIConfig';
import { DEFAULT_CONFIG } from '@/lib/config/defaults';
import { encodeConfig, decodeConfig } from '@/lib/config/url-state';
import { useSearchParams } from 'next/navigation';
import { EXPORT_RESOLUTIONS, type ExportResolutionKey } from '@/lib/export/constants';
import { getNumericRatio, getAspectRatioCSS } from '@/lib/styles/dimensions';
import { useMapExport } from '@/hooks/useMapExport';
import { cn } from '@/lib/utils';
import type { PosterConfig } from '@/types/poster';
import type MapLibreGL from 'maplibre-gl';
import { getRandomPrompts } from '@/lib/ai/prompts';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  config?: AIGeneratedConfig;
  error?: boolean;
  isStreaming?: boolean;
}

/**
 * Simple markdown renderer for chat messages
 * Handles **bold**, *italic*, and newlines
 */
function renderMarkdown(text: string): React.ReactNode {
  // Split by newlines first to handle line breaks
  return text.split('\n').map((line, lineIdx) => {
    // Process inline formatting: **bold** and *italic*
    const parts: React.ReactNode[] = [];
    let remaining = line;
    let partIdx = 0;

    while (remaining.length > 0) {
      // Match **bold** first (greedy)
      const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
      // Match *italic* (but not **)
      const italicMatch = remaining.match(/(?<!\*)\*([^*]+)\*(?!\*)/);

      // Find which comes first
      const boldIndex = boldMatch ? remaining.indexOf(boldMatch[0]) : Infinity;
      const italicIndex = italicMatch ? remaining.indexOf(italicMatch[0]) : Infinity;

      if (boldIndex === Infinity && italicIndex === Infinity) {
        // No more formatting
        parts.push(remaining);
        break;
      }

      if (boldIndex <= italicIndex && boldMatch) {
        // Process bold
        if (boldIndex > 0) {
          parts.push(remaining.slice(0, boldIndex));
        }
        parts.push(<strong key={`b-${partIdx++}`}>{boldMatch[1]}</strong>);
        remaining = remaining.slice(boldIndex + boldMatch[0].length);
      } else if (italicMatch) {
        // Process italic
        if (italicIndex > 0) {
          parts.push(remaining.slice(0, italicIndex));
        }
        parts.push(<em key={`i-${partIdx++}`}>{italicMatch[1]}</em>);
        remaining = remaining.slice(italicIndex + italicMatch[0].length);
      }
    }

    return (
      <span key={lineIdx}>
        {parts}
        {lineIdx < text.split('\n').length - 1 && <br />}
      </span>
    );
  });
}

/**
 * Color picker input component
 */
function ColorInput({
  label,
  value,
  onChange
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={value || '#000000'}
        onChange={(e) => onChange(e.target.value)}
        className="w-6 h-6 rounded cursor-pointer border border-gray-300 dark:border-gray-600"
      />
      <span className="text-xs text-gray-600 dark:text-gray-400 min-w-[70px]">{label}</span>
      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 text-xs px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-mono"
        placeholder="#000000"
      />
    </div>
  );
}

/**
 * Slider input component
 */
function SliderInput({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit = '',
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-600 dark:text-gray-400 min-w-[70px]">{label}</span>
      <input
        type="range"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        min={min}
        max={max}
        step={step}
        className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
      />
      <span className="text-xs text-gray-500 dark:text-gray-400 min-w-[40px] text-right font-mono">
        {value}{unit}
      </span>
    </div>
  );
}

/**
 * Select dropdown component
 */
function SelectInput({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-600 dark:text-gray-400 min-w-[70px]">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 text-xs px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/**
 * Multi-line text input component
 */
function TextLinesInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
}) {
  const textValue = value?.join('\n') || '';
  return (
    <div className="space-y-1">
      <span className="text-xs text-gray-600 dark:text-gray-400">{label}</span>
      <textarea
        value={textValue}
        onChange={(e) => onChange(e.target.value.split('\n').filter(line => line.trim()))}
        placeholder={placeholder}
        rows={3}
        className="w-full text-xs px-2 py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none"
      />
      <p className="text-[10px] text-gray-400">One line per entry</p>
    </div>
  );
}

/**
 * Toggle switch component
 */
function ToggleInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-600 dark:text-gray-400">{label}</span>
      <button
        onClick={() => onChange(!value)}
        className={cn(
          "w-8 h-4 rounded-full transition-colors relative",
          value ? "bg-purple-600" : "bg-gray-300 dark:bg-gray-600"
        )}
      >
        <div
          className={cn(
            "absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform",
            value ? "translate-x-4" : "translate-x-0.5"
          )}
        />
      </button>
    </div>
  );
}

/**
 * Collapsible section component
 */
function Section({
  title,
  icon: Icon,
  children,
  defaultOpen = false
}: {
  title: string;
  icon: any;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400"
      >
        <span className="flex items-center gap-2">
          <Icon className="w-3.5 h-3.5" />
          {title}
        </span>
        {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>
      {isOpen && <div className="pb-3 space-y-2">{children}</div>}
    </div>
  );
}

/**
 * Interactive config editor component
 */
function ConfigEditor({
  config,
  onChange
}: {
  config: AIGeneratedConfig;
  onChange: (config: AIGeneratedConfig) => void;
}) {
  const [showJson, setShowJson] = useState(false);

  // Helper to update nested config values
  const updateConfig = (path: string, value: any) => {
    const newConfig = { ...config };
    const keys = path.split('.');
    let current: any = newConfig;

    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) current[keys[i]] = {};
      current[keys[i]] = { ...current[keys[i]] };
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;

    onChange(newConfig);
  };

  return (
    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
      {/* Quick color preview */}
      {config.customPalette && (
        <div className="flex gap-1 mb-3">
          <div className="w-5 h-5 rounded border border-gray-300 dark:border-gray-600 cursor-pointer" style={{ backgroundColor: config.customPalette.background }} title="Background" />
          <div className="w-5 h-5 rounded border border-gray-300 dark:border-gray-600 cursor-pointer" style={{ backgroundColor: config.customPalette.roads?.motorway }} title="Motorway" />
          <div className="w-5 h-5 rounded border border-gray-300 dark:border-gray-600 cursor-pointer" style={{ backgroundColor: config.customPalette.roads?.primary }} title="Primary Road" />
          <div className="w-5 h-5 rounded border border-gray-300 dark:border-gray-600 cursor-pointer" style={{ backgroundColor: config.customPalette.water }} title="Water" />
          <div className="w-5 h-5 rounded border border-gray-300 dark:border-gray-600 cursor-pointer" style={{ backgroundColor: config.customPalette.greenSpace }} title="Parks" />
          <div className="w-5 h-5 rounded border border-gray-300 dark:border-gray-600 cursor-pointer" style={{ backgroundColor: config.customPalette.text }} title="Text" />
        </div>
      )}

      {/* Editable Sections */}
      <div className="space-y-1">
        {/* Colors Section */}
        {config.customPalette && (
          <Section title="Colors" icon={Palette} defaultOpen={true}>
            <div className="space-y-2">
              <ColorInput
                label="Background"
                value={config.customPalette.background}
                onChange={(v) => updateConfig('customPalette.background', v)}
              />
              <ColorInput
                label="Text"
                value={config.customPalette.text}
                onChange={(v) => updateConfig('customPalette.text', v)}
              />
              <ColorInput
                label="Water"
                value={config.customPalette.water}
                onChange={(v) => updateConfig('customPalette.water', v)}
              />
              <ColorInput
                label="Parks"
                value={config.customPalette.greenSpace}
                onChange={(v) => updateConfig('customPalette.greenSpace', v)}
              />
              <ColorInput
                label="Buildings"
                value={config.customPalette.buildings || config.customPalette.background}
                onChange={(v) => updateConfig('customPalette.buildings', v)}
              />

              {/* Roads subsection */}
              <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Roads</p>
                <div className="space-y-1.5">
                  <ColorInput
                    label="Motorway"
                    value={config.customPalette.roads?.motorway || ''}
                    onChange={(v) => updateConfig('customPalette.roads.motorway', v)}
                  />
                  <ColorInput
                    label="Primary"
                    value={config.customPalette.roads?.primary || ''}
                    onChange={(v) => updateConfig('customPalette.roads.primary', v)}
                  />
                  <ColorInput
                    label="Secondary"
                    value={config.customPalette.roads?.secondary || ''}
                    onChange={(v) => updateConfig('customPalette.roads.secondary', v)}
                  />
                  <ColorInput
                    label="Residential"
                    value={config.customPalette.roads?.residential || ''}
                    onChange={(v) => updateConfig('customPalette.roads.residential', v)}
                  />
                </div>
              </div>
            </div>
          </Section>
        )}

        {/* Typography Section */}
        {config.typography && (
          <Section title="Typography" icon={Type}>
            <div className="space-y-2">
              <SelectInput
                label="Font"
                value={config.typography.titleFont || 'Inter'}
                onChange={(v) => updateConfig('typography.titleFont', v)}
                options={[
                  { value: 'Inter', label: 'Inter' },
                  { value: 'Playfair Display', label: 'Playfair Display' },
                  { value: 'Bebas Neue', label: 'Bebas Neue' },
                  { value: 'Orbitron', label: 'Orbitron' },
                  { value: 'Space Mono', label: 'Space Mono' },
                  { value: 'Poiret One', label: 'Poiret One' },
                  { value: 'Cinzel', label: 'Cinzel' },
                  { value: 'Rajdhani', label: 'Rajdhani' },
                  { value: 'Cormorant Garamond', label: 'Cormorant Garamond' },
                  { value: 'Oswald', label: 'Oswald' },
                ]}
              />
              <SliderInput
                label="Size"
                value={config.typography.titleSize || 5}
                onChange={(v) => updateConfig('typography.titleSize', v)}
                min={1}
                max={15}
                step={0.5}
                unit="%"
              />
              <SliderInput
                label="Weight"
                value={config.typography.titleWeight || 700}
                onChange={(v) => updateConfig('typography.titleWeight', v)}
                min={100}
                max={900}
                step={100}
              />
              <SliderInput
                label="Spacing"
                value={config.typography.titleLetterSpacing || 0.08}
                onChange={(v) => updateConfig('typography.titleLetterSpacing', v)}
                min={0}
                max={0.5}
                step={0.01}
                unit="em"
              />
              <SelectInput
                label="Position"
                value={config.typography.position || 'bottom'}
                onChange={(v) => updateConfig('typography.position', v)}
                options={[
                  { value: 'top', label: 'Top' },
                  { value: 'center', label: 'Center' },
                  { value: 'bottom', label: 'Bottom' },
                ]}
              />
              <SelectInput
                label="Backdrop"
                value={config.typography.textBackdrop || 'none'}
                onChange={(v) => updateConfig('typography.textBackdrop', v)}
                options={[
                  { value: 'none', label: 'None' },
                  { value: 'subtle', label: 'Subtle' },
                  { value: 'strong', label: 'Strong' },
                  { value: 'gradient', label: 'Gradient' },
                ]}
              />
              <TextLinesInput
                label="Custom Lines"
                value={config.typography.customLines || []}
                onChange={(v) => updateConfig('typography.customLines', v)}
                placeholder="Where we first met&#10;June 15, 2024&#10;Forever & Always"
              />
            </div>
          </Section>
        )}

        {/* Camera/3D Section */}
        {(config.camera || config.layers?.buildings3D || config.layers?.terrain3D) && (
          <Section title="3D & Camera" icon={Layers}>
            <div className="space-y-2">
              <ToggleInput
                label="3D Buildings"
                value={config.layers?.buildings3D || false}
                onChange={(v) => updateConfig('layers.buildings3D', v)}
              />
              {config.layers?.buildings3D && (
                <SliderInput
                  label="Bldg Height"
                  value={config.layers?.buildings3DHeight || 1}
                  onChange={(v) => updateConfig('layers.buildings3DHeight', v)}
                  min={0.5}
                  max={3}
                  step={0.1}
                  unit="x"
                />
              )}
              <ToggleInput
                label="3D Terrain"
                value={config.layers?.terrain3D || false}
                onChange={(v) => updateConfig('layers.terrain3D', v)}
              />
              {config.layers?.terrain3D && (
                <SliderInput
                  label="Exaggeration"
                  value={config.layers?.terrainExaggeration || 1.5}
                  onChange={(v) => updateConfig('layers.terrainExaggeration', v)}
                  min={0.5}
                  max={1000}
                  step={1}
                  unit="x"
                />
              )}
              <SliderInput
                label="Pitch"
                value={config.camera?.pitch || 0}
                onChange={(v) => updateConfig('camera.pitch', v)}
                min={0}
                max={85}
                step={5}
                unit="°"
              />
              <SliderInput
                label="Bearing"
                value={config.camera?.bearing || 0}
                onChange={(v) => updateConfig('camera.bearing', v)}
                min={-180}
                max={180}
                step={15}
                unit="°"
              />
            </div>
          </Section>
        )}

        {/* Layers Section */}
        {config.layers && (
          <Section title="Layers" icon={Layers}>
            <div className="grid grid-cols-2 gap-2">
              <ToggleInput
                label="Streets"
                value={config.layers.streets !== false}
                onChange={(v) => updateConfig('layers.streets', v)}
              />
              <ToggleInput
                label="Buildings"
                value={config.layers.buildings !== false}
                onChange={(v) => updateConfig('layers.buildings', v)}
              />
              <ToggleInput
                label="Water"
                value={config.layers.water !== false}
                onChange={(v) => updateConfig('layers.water', v)}
              />
              <ToggleInput
                label="Parks"
                value={config.layers.parks !== false}
                onChange={(v) => updateConfig('layers.parks', v)}
              />
              <ToggleInput
                label="Terrain"
                value={config.layers.terrain || false}
                onChange={(v) => updateConfig('layers.terrain', v)}
              />
              <ToggleInput
                label="Contours"
                value={config.layers.contours || false}
                onChange={(v) => updateConfig('layers.contours', v)}
              />
              <ToggleInput
                label="Marker"
                value={config.layers.marker || false}
                onChange={(v) => updateConfig('layers.marker', v)}
              />
              <ToggleInput
                label="Labels"
                value={config.layers.labels || false}
                onChange={(v) => updateConfig('layers.labels', v)}
              />
              <ToggleInput
                label="POIs"
                value={config.layers.pois !== false}
                onChange={(v) => updateConfig('layers.pois', v)}
              />
              <ToggleInput
                label="Population"
                value={config.layers.population || false}
                onChange={(v) => updateConfig('layers.population', v)}
              />
            </div>
            {config.layers.streets !== false && (
              <SliderInput
                label="Road Weight"
                value={config.layers.roadWeight || 1}
                onChange={(v) => updateConfig('layers.roadWeight', v)}
                min={0.1}
                max={3}
                step={0.1}
                unit="x"
              />
            )}
          </Section>
        )}

        {/* Format Section */}
        {config.format && (
          <Section title="Format" icon={Layout}>
            <div className="space-y-2">
              <SelectInput
                label="Aspect"
                value={config.format.aspectRatio || '2:3'}
                onChange={(v) => updateConfig('format.aspectRatio', v)}
                options={[
                  { value: '2:3', label: '2:3 (Poster)' },
                  { value: '3:4', label: '3:4' },
                  { value: '4:5', label: '4:5' },
                  { value: '1:1', label: '1:1 (Square)' },
                  { value: 'ISO', label: 'ISO (A4/A3)' },
                ]}
              />
              <SliderInput
                label="Margin"
                value={config.format.margin || 5}
                onChange={(v) => updateConfig('format.margin', v)}
                min={0}
                max={20}
                step={1}
                unit="%"
              />
              <SelectInput
                label="Border"
                value={config.format.borderStyle || 'none'}
                onChange={(v) => updateConfig('format.borderStyle', v)}
                options={[
                  { value: 'none', label: 'None' },
                  { value: 'thin', label: 'Thin' },
                  { value: 'thick', label: 'Thick' },
                  { value: 'double', label: 'Double' },
                  { value: 'inset', label: 'Inset' },
                ]}
              />
              <SelectInput
                label="Texture"
                value={config.format.texture || 'none'}
                onChange={(v) => updateConfig('format.texture', v)}
                options={[
                  { value: 'none', label: 'None' },
                  { value: 'paper', label: 'Paper' },
                  { value: 'canvas', label: 'Canvas' },
                  { value: 'grain', label: 'Grain' },
                ]}
              />
              {config.format.texture && config.format.texture !== 'none' && (
                <SliderInput
                  label="Intensity"
                  value={config.format.textureIntensity || 50}
                  onChange={(v) => updateConfig('format.textureIntensity', v)}
                  min={0}
                  max={100}
                  step={5}
                  unit="%"
                />
              )}
            </div>
          </Section>
        )}

        {/* Location Section */}
        {config.location && (
          <Section title="Location" icon={MapPin}>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600 dark:text-gray-400 min-w-[70px]">Name</span>
                <input
                  type="text"
                  value={config.location.name || ''}
                  onChange={(e) => updateConfig('location.name', e.target.value)}
                  className="flex-1 text-xs px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600 dark:text-gray-400 min-w-[70px]">Subtitle</span>
                <input
                  type="text"
                  value={config.location.subtitle || ''}
                  onChange={(e) => updateConfig('location.subtitle', e.target.value)}
                  className="flex-1 text-xs px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>
              <SliderInput
                label="Zoom"
                value={config.location.zoom || 12}
                onChange={(v) => updateConfig('location.zoom', v)}
                min={1}
                max={18}
                step={0.5}
              />
            </div>
          </Section>
        )}

        {/* Area Highlight Section - only show if AI provided coordinates */}
        {config.areaHighlight?.coordinates && config.areaHighlight.coordinates.length >= 3 && (
          <Section title="Area Highlight" icon={MapPin}>
            <div className="space-y-2">
              <ColorInput
                label="Fill Color"
                value={config.areaHighlight.fillColor || '#ff6b6b'}
                onChange={(v) => updateConfig('areaHighlight.fillColor', v)}
              />
              <SliderInput
                label="Fill Opacity"
                value={config.areaHighlight.fillOpacity ?? 0.3}
                onChange={(v) => updateConfig('areaHighlight.fillOpacity', v)}
                min={0}
                max={1}
                step={0.1}
              />
              <ColorInput
                label="Stroke Color"
                value={config.areaHighlight.strokeColor || config.areaHighlight.fillColor || '#ff6b6b'}
                onChange={(v) => updateConfig('areaHighlight.strokeColor', v)}
              />
              <SliderInput
                label="Stroke Width"
                value={config.areaHighlight.strokeWidth ?? 2}
                onChange={(v) => updateConfig('areaHighlight.strokeWidth', v)}
                min={1}
                max={5}
                step={0.5}
                unit="px"
              />
              <button
                onClick={() => updateConfig('areaHighlight', undefined)}
                className="text-xs text-red-500 hover:text-red-700"
              >
                Remove Highlight
              </button>
            </div>
          </Section>
        )}
      </div>

      {/* Show JSON toggle */}
      <button
        onClick={() => setShowJson(!showJson)}
        className="flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 mt-2"
      >
        <Code className="w-3 h-3" />
        {showJson ? 'Hide' : 'Show'} JSON
        {showJson ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>

      {showJson && (
        <pre className="mt-2 p-3 bg-gray-900 text-gray-100 rounded-lg text-xs overflow-x-auto max-h-48 overflow-y-auto">
          {JSON.stringify(config, null, 2)}
        </pre>
      )}
    </div>
  );
}

export default function AIPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [config, setConfig] = useState<PosterConfig>(DEFAULT_CONFIG);
  const [showExamples, setShowExamples] = useState(true);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [exportResolution, setExportResolution] = useState<ExportResolutionKey>('PREVIEW');
  const [examplePrompts, setExamplePrompts] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Generate random prompts on mount (client-side only)
  useEffect(() => {
    setExamplePrompts(getRandomPrompts(10));
  }, []);

  const { isExporting, exportToPNG, setMapRef } = useMapExport(config);
  const searchParams = useSearchParams();

  // Load config from URL on mount
  useEffect(() => {
    const encoded = searchParams.get('s');
    if (encoded) {
      const decoded = decodeConfig(encoded);
      if (decoded) {
        setConfig({ ...DEFAULT_CONFIG, ...decoded } as PosterConfig);
        setShowExamples(false);
      }
    }
  }, [searchParams]);

  // Copy share link to clipboard (links to editor page)
  const handleShare = useCallback(async () => {
    const encoded = encodeConfig(config);
    const url = `${window.location.origin}/?s=${encoded}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [config]);

  // Save to localStorage
  const handleSave = useCallback(() => {
    const saved = JSON.parse(localStorage.getItem('cartoart-saved-maps') || '[]');
    const newMap = {
      id: Date.now().toString(),
      name: config.location.name || 'Untitled Map',
      config,
      createdAt: Date.now(),
    };
    saved.unshift(newMap);
    localStorage.setItem('cartoart-saved-maps', JSON.stringify(saved.slice(0, 50))); // Keep last 50
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [config]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleMapLoad = useCallback((map: MapLibreGL.Map) => {
    setMapRef(map);
  }, [setMapRef]);

  // Apply palette to map style
  const mapStyle = useMemo(() => {
    return applyPaletteToStyle(
      config.style.mapStyle,
      config.palette,
      config.layers,
      config.style.layerToggles
    );
  }, [config.style.mapStyle, config.palette, config.layers, config.style.layerToggles]);

  const numericRatio = useMemo(() => {
    return getNumericRatio(config.format.aspectRatio, config.format.orientation);
  }, [config.format.aspectRatio, config.format.orientation]);

  const sendMessage = async (messageContent: string) => {
    if (!messageContent.trim() || isLoading) return;

    setShowExamples(false);
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageContent,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Create assistant placeholder
    const assistantMessageId = (Date.now() + 1).toString();
    setMessages(prev => [
      ...prev,
      {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        isStreaming: true,
      },
    ]);

    try {
      // Build conversation for API (excluding the placeholder)
      const conversationMessages = [...messages, userMessage].map(m => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: conversationMessages }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate');
      }

      if (data.success && data.config) {
        // Apply the AI config to our current config
        const newConfig = applyAIConfig(data.config, config);
        setConfig(newConfig);

        // Update the assistant message
        const assistantContent = data.explanation
          ? `${data.explanation}\n\nI've updated the map preview with your configuration.`
          : formatConfigSummary(data.config);

        setMessages(prev =>
          prev.map(m =>
            m.id === assistantMessageId
              ? { ...m, content: assistantContent, config: data.config, isStreaming: false }
              : m
          )
        );
      } else {
        throw new Error(data.error || 'Could not parse configuration');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setMessages(prev =>
        prev.map(m =>
          m.id === assistantMessageId
            ? { ...m, content: `Error: ${errorMessage}`, error: true, isStreaming: false }
            : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleExampleClick = (prompt: string) => {
    sendMessage(prompt);
  };

  const resetConversation = () => {
    setMessages([]);
    setConfig(DEFAULT_CONFIG);
    setShowExamples(true);
    setInput('');
  };

  // Handle config changes from the interactive editor
  const handleConfigChange = useCallback((messageId: string, newAIConfig: AIGeneratedConfig) => {
    // Update the message's config
    setMessages(prev =>
      prev.map(m =>
        m.id === messageId
          ? { ...m, config: newAIConfig }
          : m
      )
    );

    // Apply the updated AI config to the main poster config
    const newConfig = applyAIConfig(newAIConfig, config);
    setConfig(newConfig);
  }, [config]);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Left Panel - Chat */}
      <div className="w-full md:w-[480px] flex flex-col border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="font-semibold text-gray-900 dark:text-white">AI Map Creator</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Powered by Claude</p>
              </div>
            </div>
          </div>
          <button
            onClick={resetConversation}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400"
            title="Start new conversation"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </header>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {showExamples && messages.length === 0 && (
            <div className="space-y-4">
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center">
                  <Wand2 className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Create Your Map with AI
                </h2>
                <p className="text-gray-600 dark:text-gray-400 max-w-sm mx-auto">
                  Describe the map poster you want to create and I&apos;ll generate it for you. Try one of these examples:
                </p>
              </div>

              <div className="grid gap-2">
                {examplePrompts.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleExampleClick(prompt)}
                    className="text-left p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors text-sm text-gray-700 dark:text-gray-300"
                  >
                    <span className="text-purple-600 dark:text-purple-400">&ldquo;</span>
                    {prompt}
                    <span className="text-purple-600 dark:text-purple-400">&rdquo;</span>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setExamplePrompts(getRandomPrompts(10))}
                className="mx-auto flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Show different ideas
              </button>
            </div>
          )}

          {messages.map(message => (
            <div
              key={message.id}
              className={cn(
                'flex gap-3',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-pink-600 flex-shrink-0 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              )}

              <div
                className={cn(
                  'max-w-[85%] rounded-2xl px-4 py-2.5',
                  message.role === 'user'
                    ? 'bg-purple-600 text-white'
                    : message.error
                    ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                )}
              >
                {message.isStreaming ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Generating your map...</span>
                  </div>
                ) : (
                  <div className="text-sm">{renderMarkdown(message.content)}</div>
                )}

                {message.config && !message.isStreaming && (
                  <ConfigEditor
                    config={message.config}
                    onChange={(newAIConfig) => handleConfigChange(message.id, newAIConfig)}
                  />
                )}
              </div>

              {message.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0 flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    You
                  </span>
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 dark:border-gray-800 p-4">
          <form onSubmit={handleSubmit} className="relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe your map poster..."
              rows={2}
              className="w-full resize-none rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 pr-12 text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-colors"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className={cn(
                'absolute right-2 bottom-2 p-2 rounded-lg transition-colors',
                input.trim() && !isLoading
                  ? 'bg-purple-600 text-white hover:bg-purple-700'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
              )}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </form>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
            Try: &ldquo;Make it more dramatic&rdquo; or &ldquo;Add contour lines&rdquo; to refine
          </p>
        </div>
      </div>

      {/* Right Panel - Map Preview */}
      <div className="hidden md:flex flex-1 flex-col bg-gray-100 dark:bg-gray-950">
        {/* Preview Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-gray-500" />
            <span className="font-medium text-gray-900 dark:text-white">Live Preview</span>
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
              {config.style.name} • {config.palette.name}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/?s=${encodeConfig(config)}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shadow-sm"
            >
              <ExternalLink className="w-4 h-4" />
              Open in Editor
            </Link>
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shadow-sm"
              title="Copy share link"
            >
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Share2 className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Share'}
            </button>
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shadow-sm"
              title="Quick save to browser"
            >
              {saved ? <Check className="w-4 h-4 text-green-500" /> : <Save className="w-4 h-4" />}
              {saved ? 'Saved!' : 'Save'}
            </button>
            <div className="flex items-center shadow-sm">
              <select
                value={exportResolution}
                onChange={(e) => setExportResolution(e.target.value as ExportResolutionKey)}
                className="h-9 text-xs rounded-l-lg border border-r-0 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {Object.entries(EXPORT_RESOLUTIONS).map(([key, res]) => (
                  <option key={key} value={key}>{res.name}</option>
                ))}
              </select>
              <button
                onClick={() => exportToPNG({ resolution: EXPORT_RESOLUTIONS[exportResolution] })}
                disabled={isExporting}
                className="inline-flex items-center gap-2 px-4 h-9 text-sm rounded-r-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                {isExporting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Map Canvas */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div
            className="relative shadow-2xl bg-white flex flex-col transition-all duration-300 ease-in-out ring-1 ring-black/5"
            style={{
              aspectRatio: getAspectRatioCSS(config.format.aspectRatio, config.format.orientation),
              backgroundColor: config.palette.background,
              width: `min(calc(100% - 4rem), calc((100vh - 12rem) * ${numericRatio}))`,
              height: 'auto',
              maxHeight: 'calc(100vh - 12rem)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              containerType: 'size',
            }}
          >
            {/* Map Window */}
            <div
              className="absolute overflow-hidden"
              style={{
                top: `${config.format.margin}%`,
                left: `${config.format.margin}%`,
                right: `${config.format.margin}%`,
                bottom: `${config.format.margin}%`,
                borderRadius: config.format.maskShape === 'circular' ? '50%' : '0',
              }}
            >
              <MapPreview
                mapStyle={mapStyle}
                location={config.location}
                format={config.format}
                showMarker={config.layers.marker}
                markerColor={config.layers.markerColor || config.palette.accent || config.palette.text}
                onMapLoad={handleMapLoad}
                layers={config.layers}
                layerToggles={config.style.layerToggles}
                camera={config.camera}
                areaHighlight={config.areaHighlight}
              />
            </div>

            {/* Text Overlay */}
            <TextOverlay config={config} />

            {/* Border Overlay */}
            {config.format.borderStyle !== 'none' && (
              <div
                className="absolute pointer-events-none z-30"
                style={{
                  top: `${config.format.margin}%`,
                  left: `${config.format.margin}%`,
                  right: `${config.format.margin}%`,
                  bottom: `${config.format.margin}%`,
                  padding: config.format.borderStyle === 'inset' ? '2%' : '0',
                }}
              >
                <div
                  className="w-full h-full"
                  style={{
                    border: `${
                      config.format.borderStyle === 'thick' ? '3px' : '1px'
                    } solid ${config.palette.accent || config.palette.text}`,
                    borderRadius: config.format.maskShape === 'circular' ? '50%' : '0',
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Format AI config into a human-readable summary
 */
function formatConfigSummary(config: AIGeneratedConfig): string {
  const parts: string[] = [];

  if (config.location?.name) {
    parts.push(`📍 **Location:** ${config.location.name}`);
  }

  if (config.styleId) {
    const styleNames: Record<string, string> = {
      minimal: 'Minimal Line Art',
      'dark-mode': 'Dark Mode / Noir',
      midnight: 'Midnight',
      blueprint: 'Blueprint',
      vintage: 'Vintage',
      topographic: 'Topographic',
      watercolor: 'Watercolor',
      abstract: 'Abstract',
      atmospheric: 'Atmospheric',
      organic: 'Organic',
      retro: 'Retro',
    };
    parts.push(`🎨 **Style:** ${styleNames[config.styleId] || config.styleId}`);
  }

  if (config.paletteId) {
    parts.push(`🎭 **Palette:** ${config.paletteId.split('-').slice(1).join(' ')}`);
  }

  if (config.typography?.titleFont) {
    parts.push(`✍️ **Font:** ${config.typography.titleFont}`);
  }

  if (config.format?.aspectRatio || config.format?.orientation) {
    const aspect = config.format.aspectRatio || '2:3';
    const orientation = config.format.orientation || 'portrait';
    parts.push(`📐 **Format:** ${aspect} ${orientation}`);
  }

  if (parts.length === 0) {
    return "I've updated the map with your configuration. Feel free to ask for changes!";
  }

  return parts.join('\n') + '\n\n*Feel free to ask for any changes!*';
}

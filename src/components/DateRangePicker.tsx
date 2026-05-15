import { useState } from 'react';
import { CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { DatePreset, DateRange } from '@/types';
import { DATE_PRESET_LABELS } from '@/types';
import { cn, formatDate } from '@/lib/utils';

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

const PRESETS: DatePreset[] = ['today', 'last_7d', 'last_14d', 'last_30d', 'custom'];

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [customSince, setCustomSince] = useState(value.since ?? '');
  const [customUntil, setCustomUntil] = useState(value.until ?? '');

  const today = new Date().toISOString().split('T')[0];

  const handlePreset = (preset: DatePreset) => {
    if (preset !== 'custom') {
      onChange({ preset });
      setOpen(false);
    } else {
      onChange({ preset: 'custom', since: customSince || today, until: customUntil || today });
    }
  };

  const handleCustomApply = () => {
    if (customSince && customUntil) {
      onChange({ preset: 'custom', since: customSince, until: customUntil });
      setOpen(false);
    }
  };

  const displayLabel = () => {
    if (value.preset === 'custom' && value.since && value.until) {
      return `${formatDate(value.since)} – ${formatDate(value.until)}`;
    }
    return DATE_PRESET_LABELS[value.preset];
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="md" className="gap-2 min-w-[160px]">
          <CalendarDays className="h-4 w-4 text-gray-500" />
          <span>{displayLabel()}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="end">
        <div className="space-y-1 mb-3">
          {PRESETS.filter((p) => p !== 'custom').map((preset) => (
            <button
              key={preset}
              onClick={() => handlePreset(preset)}
              className={cn(
                'w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors',
                value.preset === preset
                  ? 'bg-indigo-600/15 text-indigo-400'
                  : 'text-gray-400 hover:bg-[#1e1e2a] hover:text-white',
              )}
            >
              {DATE_PRESET_LABELS[preset]}
            </button>
          ))}
        </div>

        <div className="border-t border-[#2a2a38] pt-3">
          <p className={cn(
            'text-xs font-medium mb-2',
            value.preset === 'custom' ? 'text-indigo-400' : 'text-gray-500',
          )}>
            Personalizado
          </p>
          <div className="space-y-2">
            <div>
              <Label className="text-xs text-gray-600">De</Label>
              <Input
                type="date"
                value={customSince}
                onChange={(e) => setCustomSince(e.target.value)}
                max={customUntil || today}
                className="mt-1 text-xs h-8"
              />
            </div>
            <div>
              <Label className="text-xs text-gray-600">Até</Label>
              <Input
                type="date"
                value={customUntil}
                onChange={(e) => setCustomUntil(e.target.value)}
                min={customSince}
                max={today}
                className="mt-1 text-xs h-8"
              />
            </div>
            <Button
              size="sm"
              className="w-full mt-1"
              onClick={handleCustomApply}
              disabled={!customSince || !customUntil}
            >
              Aplicar
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { upsertPart } from "@/lib/pc/store";
import type {
  CasePart,
  CoolerPart,
  CpuPart,
  FormFactor,
  GpuPart,
  MotherboardPart,
  Part,
  PartCategory,
  PsuPart,
  RamPart,
  RamType,
  StoragePart,
} from "@/lib/pc/types";

const RAM_TYPES: RamType[] = ["DDR3", "DDR4", "DDR5"];
const FORM_FACTORS: FormFactor[] = ["Mini-ITX", "Micro-ATX", "ATX", "E-ATX"];
const COMMON_SOCKETS = ["AM4", "AM5", "LGA1151", "LGA1200", "LGA1700", "LGA1851", "TR4", "sTRX4"];

interface Props {
  category: PartCategory;
  initial?: Part;
  onSaved: (p: Part) => void;
  onCancel: () => void;
}

function newId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export function PartForm({ category, initial, onSaved, onCancel }: Props) {
  const [draft, setDraft] = useState<Part>(() => {
    if (initial) return initial;
    const base = { id: newId(category), name: "", brand: "", price: undefined as any };
    switch (category) {
      case "cpu":
        return {
          ...base,
          category: "cpu",
          socket: "AM5",
          tdp: 105,
          ramType: "DDR5",
          maxRamSpeed: 5200,
          memoryChannels: 2,
          integratedGraphics: true,
          cores: 8,
        } as CpuPart;
      case "motherboard":
        return {
          ...base,
          category: "motherboard",
          socket: "AM5",
          formFactor: "ATX",
          ramType: "DDR5",
          ramSlots: 4,
          maxRamSpeed: 6400,
          memoryChannels: 2,
          m2Slots: 2,
          sataPorts: 4,
          pcieX16Slots: 1,
          eps8Pin: 1,
        } as MotherboardPart;
      case "ram":
        return {
          ...base,
          category: "ram",
          ramType: "DDR5",
          speed: 6000,
          sizeGb: 16,
          sticks: 2,
        } as RamPart;
      case "gpu":
        return {
          ...base,
          category: "gpu",
          lengthMm: 300,
          tdp: 220,
          pcieConnectors: { pin8: 2, pin6: 0, pin12vhpwr: 0 },
        } as GpuPart;
      case "storage":
        return {
          ...base,
          category: "storage",
          interface: "M.2 NVMe",
          sizeGb: 1000,
        } as StoragePart;
      case "psu":
        return {
          ...base,
          category: "psu",
          wattage: 750,
          formFactor: "ATX",
          efficiency: "80+ Gold",
          pcie8Pin: 2,
          eps8Pin: 1,
          pcie12vhpwr: 0,
          modular: "Full",
        } as PsuPart;
      case "case":
        return {
          ...base,
          category: "case",
          supportedFormFactors: ["ATX", "Micro-ATX", "Mini-ITX"],
          maxGpuLengthMm: 340,
          maxCoolerHeightMm: 165,
          psuFormFactors: ["ATX"],
        } as CasePart;
      case "cooler":
        return {
          ...base,
          category: "cooler",
          supportedSockets: ["AM5", "LGA1700"],
          heightMm: 155,
          tdpRating: 200,
          type: "Air",
        } as CoolerPart;
    }
  });

  function update<K extends keyof Part>(key: K, value: any) {
    setDraft((d) => ({ ...d, [key]: value }) as Part);
  }

  function submit() {
    if (!draft.name.trim()) return;
    upsertPart(draft);
    onSaved(draft);
  }

  return (
    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
      <Row>
        <Field label="Name">
          <Input value={draft.name} onChange={(e) => update("name", e.target.value)} autoFocus />
        </Field>
        <Field label="Brand">
          <Input value={draft.brand ?? ""} onChange={(e) => update("brand", e.target.value)} />
        </Field>
        <Field label="Price (USD)">
          <Input
            type="number"
            value={draft.price ?? ""}
            onChange={(e) => update("price", e.target.value === "" ? undefined : Number(e.target.value))}
          />
        </Field>
        <Field label="Amazon ASIN">
          <Input
            value={draft.asin ?? ""}
            onChange={(e) => update("asin", e.target.value.trim() || undefined)}
            placeholder="B0XXXXXXXX"
            maxLength={10}
          />
        </Field>
        <Field label="Image URL">
          <Input
            value={draft.imageUrl ?? ""}
            onChange={(e) => update("imageUrl", e.target.value.trim() || undefined)}
            placeholder="https://…"
          />
        </Field>
      </Row>

      {draft.imageUrl && (
        <div className="flex items-center gap-3">
          <img
            src={draft.imageUrl}
            alt=""
            className="h-16 w-16 rounded-md border border-border bg-white object-contain"
          />
          <span className="text-xs text-muted-foreground font-mono">Preview</span>
        </div>
      )}


      {draft.category === "cpu" && <CpuFields d={draft} u={update} />}
      {draft.category === "motherboard" && <MoboFields d={draft} u={update} />}
      {draft.category === "ram" && <RamFields d={draft} u={update} />}
      {draft.category === "gpu" && <GpuFields d={draft} u={update} />}
      {draft.category === "storage" && <StorageFields d={draft} u={update} />}
      {draft.category === "psu" && <PsuFields d={draft} u={update} />}
      {draft.category === "case" && <CaseFields d={draft} u={update} />}
      {draft.category === "cooler" && <CoolerFields d={draft} u={update} />}

      <div className="flex justify-end gap-2 pt-2 border-t border-border">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={submit} disabled={!draft.name.trim()}>
          Save part
        </Button>
      </div>
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 md:grid-cols-3 gap-3">{children}</div>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}

function NumInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <Input type="number" value={value} onChange={(e) => onChange(Number(e.target.value) || 0)} />
  );
}

function SocketSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const options = Array.from(new Set([...COMMON_SOCKETS, value].filter(Boolean)));
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((s) => (
          <SelectItem key={s} value={s}>
            {s}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/* Category-specific field groups */

function CpuFields({ d, u }: { d: CpuPart; u: (k: any, v: any) => void }) {
  return (
    <>
      <Row>
        <Field label="Socket">
          <SocketSelect value={d.socket} onChange={(v) => u("socket", v)} />
        </Field>
        <Field label="TDP (W)">
          <NumInput value={d.tdp} onChange={(v) => u("tdp", v)} />
        </Field>
        <Field label="Cores">
          <NumInput value={d.cores ?? 0} onChange={(v) => u("cores", v)} />
        </Field>
      </Row>
      <Row>
        <Field label="RAM type">
          <Select value={d.ramType} onValueChange={(v) => u("ramType", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{RAM_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
        <Field label="Max RAM (MT/s)">
          <NumInput value={d.maxRamSpeed} onChange={(v) => u("maxRamSpeed", v)} />
        </Field>
        <Field label="Memory channels">
          <NumInput value={d.memoryChannels} onChange={(v) => u("memoryChannels", v)} />
        </Field>
      </Row>
      <div className="flex items-center gap-2">
        <Checkbox
          id="iGPU"
          checked={d.integratedGraphics}
          onCheckedChange={(v) => u("integratedGraphics", Boolean(v))}
        />
        <Label htmlFor="iGPU" className="text-sm">
          Has integrated graphics
        </Label>
      </div>
    </>
  );
}

function MoboFields({ d, u }: { d: MotherboardPart; u: (k: any, v: any) => void }) {
  return (
    <>
      <Row>
        <Field label="Socket"><SocketSelect value={d.socket} onChange={(v) => u("socket", v)} /></Field>
        <Field label="Form factor">
          <Select value={d.formFactor} onValueChange={(v) => u("formFactor", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{FORM_FACTORS.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
        <Field label="Chipset"><Input value={d.chipset ?? ""} onChange={(e) => u("chipset", e.target.value)} /></Field>
      </Row>
      <Row>
        <Field label="RAM type">
          <Select value={d.ramType} onValueChange={(v) => u("ramType", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{RAM_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
        <Field label="RAM slots"><NumInput value={d.ramSlots} onChange={(v) => u("ramSlots", v)} /></Field>
        <Field label="Max RAM (MT/s)"><NumInput value={d.maxRamSpeed} onChange={(v) => u("maxRamSpeed", v)} /></Field>
      </Row>
      <Row>
        <Field label="Mem channels"><NumInput value={d.memoryChannels} onChange={(v) => u("memoryChannels", v)} /></Field>
        <Field label="M.2 slots"><NumInput value={d.m2Slots} onChange={(v) => u("m2Slots", v)} /></Field>
        <Field label="SATA ports"><NumInput value={d.sataPorts} onChange={(v) => u("sataPorts", v)} /></Field>
      </Row>
      <Row>
        <Field label="PCIe x16 slots"><NumInput value={d.pcieX16Slots} onChange={(v) => u("pcieX16Slots", v)} /></Field>
        <Field label="EPS 8-pin"><NumInput value={d.eps8Pin} onChange={(v) => u("eps8Pin", v)} /></Field>
      </Row>
    </>
  );
}

function RamFields({ d, u }: { d: RamPart; u: (k: any, v: any) => void }) {
  return (
    <Row>
      <Field label="Type">
        <Select value={d.ramType} onValueChange={(v) => u("ramType", v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{RAM_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
        </Select>
      </Field>
      <Field label="Speed (MT/s)"><NumInput value={d.speed} onChange={(v) => u("speed", v)} /></Field>
      <Field label="Size per stick (GB)"><NumInput value={d.sizeGb} onChange={(v) => u("sizeGb", v)} /></Field>
      <Field label="Sticks"><NumInput value={d.sticks} onChange={(v) => u("sticks", v)} /></Field>
    </Row>
  );
}

function GpuFields({ d, u }: { d: GpuPart; u: (k: any, v: any) => void }) {
  return (
    <>
      <Row>
        <Field label="Length (mm)"><NumInput value={d.lengthMm} onChange={(v) => u("lengthMm", v)} /></Field>
        <Field label="TDP (W)"><NumInput value={d.tdp} onChange={(v) => u("tdp", v)} /></Field>
      </Row>
      <Row>
        <Field label="PCIe 8-pin">
          <NumInput value={d.pcieConnectors.pin8} onChange={(v) => u("pcieConnectors", { ...d.pcieConnectors, pin8: v })} />
        </Field>
        <Field label="PCIe 6-pin">
          <NumInput value={d.pcieConnectors.pin6} onChange={(v) => u("pcieConnectors", { ...d.pcieConnectors, pin6: v })} />
        </Field>
        <Field label="12VHPWR / 16-pin">
          <NumInput value={d.pcieConnectors.pin12vhpwr} onChange={(v) => u("pcieConnectors", { ...d.pcieConnectors, pin12vhpwr: v })} />
        </Field>
      </Row>
    </>
  );
}

function StorageFields({ d, u }: { d: StoragePart; u: (k: any, v: any) => void }) {
  return (
    <Row>
      <Field label="Interface">
        <Select value={d.interface} onValueChange={(v) => u("interface", v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="M.2 NVMe">M.2 NVMe</SelectItem>
            <SelectItem value="M.2 SATA">M.2 SATA</SelectItem>
            <SelectItem value="SATA">SATA</SelectItem>
            <SelectItem value="PCIe">PCIe add-in card</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      <Field label="Size (GB)"><NumInput value={d.sizeGb} onChange={(v) => u("sizeGb", v)} /></Field>
    </Row>
  );
}

function PsuFields({ d, u }: { d: PsuPart; u: (k: any, v: any) => void }) {
  return (
    <>
      <Row>
        <Field label="Wattage"><NumInput value={d.wattage} onChange={(v) => u("wattage", v)} /></Field>
        <Field label="Form factor">
          <Select value={d.formFactor} onValueChange={(v) => u("formFactor", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ATX">ATX</SelectItem>
              <SelectItem value="SFX">SFX</SelectItem>
              <SelectItem value="SFX-L">SFX-L</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Efficiency"><Input value={d.efficiency ?? ""} onChange={(e) => u("efficiency", e.target.value)} /></Field>
      </Row>
      <Row>
        <Field label="PCIe 8-pin"><NumInput value={d.pcie8Pin} onChange={(v) => u("pcie8Pin", v)} /></Field>
        <Field label="EPS 8-pin"><NumInput value={d.eps8Pin} onChange={(v) => u("eps8Pin", v)} /></Field>
        <Field label="12VHPWR"><NumInput value={d.pcie12vhpwr} onChange={(v) => u("pcie12vhpwr", v)} /></Field>
      </Row>
    </>
  );
}

function CaseFields({ d, u }: { d: CasePart; u: (k: any, v: any) => void }) {
  const toggleFF = (f: FormFactor) => {
    const has = d.supportedFormFactors.includes(f);
    u("supportedFormFactors", has ? d.supportedFormFactors.filter((x) => x !== f) : [...d.supportedFormFactors, f]);
  };
  const togglePsu = (f: "ATX" | "SFX" | "SFX-L") => {
    const has = d.psuFormFactors.includes(f);
    u("psuFormFactors", has ? d.psuFormFactors.filter((x) => x !== f) : [...d.psuFormFactors, f]);
  };
  return (
    <>
      <Field label="Supported motherboard sizes">
        <div className="flex flex-wrap gap-2">
          {FORM_FACTORS.map((f) => (
            <label key={f} className="flex items-center gap-1.5 text-sm cursor-pointer">
              <Checkbox checked={d.supportedFormFactors.includes(f)} onCheckedChange={() => toggleFF(f)} />
              {f}
            </label>
          ))}
        </div>
      </Field>
      <Row>
        <Field label="Max GPU length (mm)"><NumInput value={d.maxGpuLengthMm} onChange={(v) => u("maxGpuLengthMm", v)} /></Field>
        <Field label="Max cooler height (mm)"><NumInput value={d.maxCoolerHeightMm} onChange={(v) => u("maxCoolerHeightMm", v)} /></Field>
      </Row>
      <Field label="PSU form factors">
        <div className="flex flex-wrap gap-2">
          {(["ATX", "SFX", "SFX-L"] as const).map((f) => (
            <label key={f} className="flex items-center gap-1.5 text-sm cursor-pointer">
              <Checkbox checked={d.psuFormFactors.includes(f)} onCheckedChange={() => togglePsu(f)} />
              {f}
            </label>
          ))}
        </div>
      </Field>
    </>
  );
}

function CoolerFields({ d, u }: { d: CoolerPart; u: (k: any, v: any) => void }) {
  const [socketInput, setSocketInput] = useState("");
  return (
    <>
      <Row>
        <Field label="Type">
          <Select value={d.type} onValueChange={(v) => u("type", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Air">Air</SelectItem>
              <SelectItem value="AIO">AIO liquid</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Height (mm, 0 for AIO block)"><NumInput value={d.heightMm} onChange={(v) => u("heightMm", v)} /></Field>
        <Field label="TDP rating (W)"><NumInput value={d.tdpRating} onChange={(v) => u("tdpRating", v)} /></Field>
      </Row>
      <Field label="Supported sockets">
        <div className="flex flex-wrap gap-1.5 mb-2">
          {d.supportedSockets.map((s) => (
            <button
              key={s}
              onClick={() => u("supportedSockets", d.supportedSockets.filter((x) => x !== s))}
              className="rounded-md bg-primary/15 border border-primary/40 text-primary px-2 py-0.5 text-xs font-mono hover:bg-destructive/20 hover:border-destructive/50 hover:text-destructive"
            >
              {s} ×
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <Select value={socketInput} onValueChange={(v) => {
            if (!d.supportedSockets.includes(v)) u("supportedSockets", [...d.supportedSockets, v]);
            setSocketInput("");
          }}>
            <SelectTrigger><SelectValue placeholder="Add socket" /></SelectTrigger>
            <SelectContent>
              {COMMON_SOCKETS.filter((s) => !d.supportedSockets.includes(s)).map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Field>
    </>
  );
}

const SUGGESTIONS = ["Vegetarian", "No shellfish", "Loves spicy food", "Not a fan of loud places"];

/** Standing tastes that TableUs considers in every plan. Only the owner sees them. */
export function TasteField({ value, onChange }: { value: string; onChange: (next: string) => void }) {
  const add = (item: string) => onChange(value.trim() ? `${value.trim().replace(/[.,]$/, "")}, ${item.toLowerCase()}` : item);
  return (
    <div>
      <label htmlFor="taste" className="mb-1 block font-semibold">What you always want <span className="font-normal text-moss">(optional)</span></label>
      <textarea
        id="taste"
        className="field min-h-24"
        maxLength={600}
        placeholder="Allergies, foods you love or avoid, the kind of places you like"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <div className="mt-2 flex flex-wrap gap-2">
        {SUGGESTIONS.filter((item) => !value.toLowerCase().includes(item.toLowerCase())).map((item) => (
          <button key={item} type="button" className="chip text-sm" onClick={() => add(item)}>+ {item}</button>
        ))}
      </div>
      <p className="mt-2 text-sm text-moss">Used for every plan you join. Only you can see this.</p>
    </div>
  );
}

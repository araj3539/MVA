export default function LanguageSelect({ lang, setLang }) {
  return (
    <select value={lang} onChange={e => setLang(e.target.value)}>
      <option value="en-US">English</option>
      <option value="hi-IN">Hindi</option>
    </select>
  );
}

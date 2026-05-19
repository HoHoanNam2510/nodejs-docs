import { useState } from 'react';

interface Props {
  code: string;
  html?: boolean;
  standalone?: boolean;
}

export default function CodeBlock({ code, html, standalone }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = html ? code.replace(/<[^>]+>/g, '') : code;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className={standalone ? 'pre-wrap-standalone' : 'pre-wrap'}>
      <button className={`copy-btn${copied ? ' copied' : ''}`} onClick={handleCopy}>
        {copied ? 'copied!' : 'copy'}
      </button>
      {html ? <pre dangerouslySetInnerHTML={{ __html: code }} /> : <pre>{code}</pre>}
    </div>
  );
}

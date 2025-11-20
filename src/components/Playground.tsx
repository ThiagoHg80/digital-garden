import { useRef, useEffect } from "react";

export default function Playground({ children }) {
  const iframe = useRef(null);

  useEffect(() => {
    const doc = `
<!DOCTYPE html>
<html>
<body>
<div id="root"></div>
<script>
try {
${children}
} catch (err) {
  document.body.innerHTML = "<pre style='color:red'>" + err + "</pre>";
}
</script>
</body>
</html>`;
    iframe.current.srcdoc = doc;
  }, [children]);

  return (
    <iframe
      ref={iframe}
      sandbox="allow-scripts"
      style={{ width: "100%", height: "300px", border: "1px solid #ddd" }}
    />
  );
}

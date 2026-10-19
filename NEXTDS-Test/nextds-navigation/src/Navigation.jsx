/* @nextds/navigation — the NEXT Design System navigation for React: the vertical bar with drill-down menus, and the app header.
 * Generated from the Workbench (NEXTDS-Test/Table.jsx). Edit the workbench, then run npm run extract and npm run build.
 */
import { useState, useRef, useEffect, useLayoutEffect } from "react";

/* ---------- shared with the table: keyboard-only focus rings and tooltips ---------- */
let kbdTracking = false;
function trackKeyboardFocus() {
  if (kbdTracking || typeof document === "undefined") return;
  kbdTracking = true;
  const html = document.documentElement;
  document.addEventListener("keydown", (e) => { if (e.key === "Tab") html.setAttribute("data-hvt-kbd", ""); }, true);
  document.addEventListener("pointerdown", () => html.removeAttribute("data-hvt-kbd"), true);
}
function useTips(ref, scope) {
  const [tip, setTip] = useState(null);
  useEffect(trackKeyboardFocus, []);
  useEffect(() => {
    const root = ref.current;
    if (!root) return undefined;
    let timer = 0, cur = null;
    const mine = (el) => el && root.contains(el) && el.closest(scope) === root; // a nested table shows its own tooltips
    const show = (el) => {
      const text = el.getAttribute("data-tip");
      if (!text) return;
      const r = el.getBoundingClientRect();
      setTip({ text, x: r.left + r.width / 2, top: r.top, bottom: r.bottom, right: r.right, side: el.getAttribute("data-tip-side") });
    };
    const hide = () => { clearTimeout(timer); cur = null; setTip(null); };
    const at = (x, y) => { const el = document.elementFromPoint(x, y); return el && el.closest ? el.closest("[data-tip]") : null; };
    const move = (e) => { // follows the pointer by position, so disabled buttons (no events of their own) show their tooltip too
      if (e.pointerType && e.pointerType !== "mouse") return;
      const el = at(e.clientX, e.clientY);
      const t = mine(el) ? el : null;
      if (t === cur) return;
      clearTimeout(timer); setTip(null); cur = t;
      if (t) timer = setTimeout(() => show(t), 500);
    };
    const focus = (e) => {
      const el = e.target.closest && e.target.closest("[data-tip]");
      if (mine(el) && document.documentElement.hasAttribute("data-hvt-kbd")) { cur = el; show(el); } // a tooltip on focus only for keyboard focus
    };
    document.addEventListener("pointermove", move);
    root.addEventListener("pointerdown", hide, true);
    root.addEventListener("focusin", focus);
    root.addEventListener("focusout", hide);
    window.addEventListener("scroll", hide, true);
    window.addEventListener("blur", hide);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("pointermove", move);
      root.removeEventListener("pointerdown", hide, true);
      root.removeEventListener("focusin", focus);
      root.removeEventListener("focusout", hide);
      window.removeEventListener("scroll", hide, true);
      window.removeEventListener("blur", hide);
    };
  }, [ref, scope]);
  return tip;
}
function TipBubble({ tip }) {
  const ref = useRef(null);
  const [pos, setPos] = useState(null);
  useLayoutEffect(() => {
    if (!tip || !ref.current) { setPos(null); return; }
    const w = ref.current.offsetWidth, h = ref.current.offsetHeight;
    if (tip.side === "right") { setPos({ left: tip.right + 8, top: Math.round((tip.top + tip.bottom) / 2 - h / 2) }); return; } // beside the item (an icon-only rail)
    let top = tip.top - h - 8;
    if (top < 8) top = tip.bottom + 8;
    const left = Math.min(Math.max(8, tip.x - w / 2), window.innerWidth - w - 8);
    setPos({ left, top });
  }, [tip]);
  if (!tip) return null;
  return (<div ref={ref} role="tooltip" className={`hvt-tip${pos ? " is-in" : ""}`} style={pos ? { left: pos.left, top: pos.top } : { left: -9999, top: 0 }}>{tip.text}</div>);
}

/* ---------- Navigation (NAVIGATION in the library): the vertical bar with its drill-down menus, and the app header ----------
   Replicated from VSP_360_Nav_Component_1.5.svg, Collapse_False / Menu_*.svg and HEADER.svg. */
const NAV_ICONS = { // paths from VSP_360_Nav_Component_1.5.svg, kept at their place in the drawing; the viewBox picks the 16px square
  toggle: { y: 25, html: `<path d="M44.5 25.6818C44.5 25.5814 44.4186 25.5 44.3182 25.5H40.5V39.5H44.3182C44.4186 39.5 44.5 39.4186 44.5 39.3182V25.6818ZM39.5 39.5V25.5H30.6818C30.5814 25.5 30.5 25.5814 30.5 25.6818V39.3182C30.5 39.4186 30.5814 39.5 30.6818 39.5H39.5ZM44.3182 24.5C44.9709 24.5 45.5 25.0291 45.5 25.6818V39.3182C45.5 39.9709 44.9709 40.5 44.3182 40.5H30.6818C30.0291 40.5 29.5 39.9709 29.5 39.3182V25.6818C29.5 25.0291 30.0291 24.5 30.6818 24.5H44.3182Z" fill-rule="evenodd" clip-rule="evenodd" fill="currentColor"/>` },
  dashboard: { y: 80, html: `<path d="M37.5692 80.0853C37.7058 80.0287 37.8522 79.9995 38 79.9995C38.1478 79.9995 38.2942 80.0287 38.4308 80.0853C38.5674 80.1419 38.6915 80.2249 38.7959 80.3295L45.0457 86.5793C45.1502 86.6838 45.2332 86.8081 45.2897 86.9447C45.3461 87.0813 45.3751 87.2276 45.375 87.3754V94.875C45.375 95.1511 45.1511 95.375 44.875 95.375H39.875C39.5989 95.375 39.375 95.1511 39.375 94.875V90.375H36.625V94.875C36.625 95.1511 36.4011 95.375 36.125 95.375H31.125C30.8489 95.375 30.625 95.1511 30.625 94.875V87.3751C30.6249 87.2275 30.6539 87.0811 30.7103 86.9447C30.7668 86.8081 30.8496 86.684 30.9541 86.5795L37.2041 80.3295C37.3085 80.2249 37.4326 80.1419 37.5692 80.0853ZM38 80.9995C37.9836 80.9995 37.9673 81.0027 37.9521 81.009C37.937 81.0153 37.9232 81.0246 37.9116 81.0362L31.6616 87.2862C31.65 87.2978 31.6408 87.3116 31.6345 87.3268C31.6282 87.3419 31.625 87.3582 31.625 87.3746L31.625 94.375H35.625V89.875C35.625 89.5989 35.8489 89.375 36.125 89.375H39.875C40.1511 89.375 40.375 89.5989 40.375 89.875V94.375H44.375V87.375C44.375 87.3586 44.3718 87.3419 44.3655 87.3268C44.3592 87.3116 44.35 87.2978 44.3384 87.2862L38.0886 81.0364C38.077 81.0247 38.063 81.0153 38.0479 81.009C38.0327 81.0027 38.0164 80.9995 38 80.9995Z" fill-rule="evenodd" clip-rule="evenodd" fill="currentColor"/>` },
  inventory: { y: 128, html: `<path d="M33.3781 130.037C32.2017 130.679 31.625 131.483 31.625 132.25C31.625 133.017 32.2017 133.821 33.3781 134.463C34.5355 135.094 36.1687 135.5 38 135.5C39.8313 135.5 41.4645 135.094 42.6219 134.463C43.7983 133.821 44.375 133.017 44.375 132.25C44.375 131.483 43.7983 130.679 42.6219 130.037C41.4645 129.406 39.8313 129 38 129C36.1687 129 34.5355 129.406 33.3781 130.037ZM32.8992 129.159C34.23 128.434 36.0343 128 38 128C39.9657 128 41.77 128.434 43.1008 129.159C44.4127 129.875 45.375 130.946 45.375 132.25C45.375 133.554 44.4127 134.625 43.1008 135.341C41.77 136.066 39.9657 136.5 38 136.5C36.0343 136.5 34.23 136.066 32.8992 135.341C31.5873 134.625 30.625 133.554 30.625 132.25C30.625 130.946 31.5873 129.875 32.8992 129.159Z" fill-rule="evenodd" clip-rule="evenodd" fill="currentColor"/><path d="M31.125 131.75C31.4011 131.75 31.625 131.974 31.625 132.25V136C31.625 136.767 32.2017 137.571 33.3781 138.213C34.5356 138.844 36.1687 139.25 38 139.25C39.8313 139.25 41.4644 138.844 42.6219 138.213C43.7983 137.571 44.375 136.767 44.375 136V132.25C44.375 131.974 44.5989 131.75 44.875 131.75C45.1511 131.75 45.375 131.974 45.375 132.25V136C45.375 137.304 44.4127 138.375 43.1008 139.091C41.7699 139.816 39.9656 140.25 38 140.25C36.0344 140.25 34.2301 139.816 32.8992 139.091C31.5873 138.375 30.625 137.304 30.625 136V132.25C30.625 131.974 30.8489 131.75 31.125 131.75Z" fill-rule="evenodd" clip-rule="evenodd" fill="currentColor"/><path d="M31.125 135.5C31.4011 135.5 31.625 135.724 31.625 136V139.75C31.625 140.517 32.2017 141.321 33.3781 141.963C34.5356 142.594 36.1687 143 38 143C39.8313 143 41.4644 142.594 42.6219 141.963C43.7983 141.321 44.375 140.517 44.375 139.75V136C44.375 135.724 44.5989 135.5 44.875 135.5C45.1511 135.5 45.375 135.724 45.375 136V139.75C45.375 141.054 44.4127 142.125 43.1008 142.841C41.7699 143.566 39.9656 144 38 144C36.0344 144 34.2301 143.566 32.8992 142.841C31.5873 142.125 30.625 141.054 30.625 139.75V136C30.625 135.724 30.8489 135.5 31.125 135.5Z" fill-rule="evenodd" clip-rule="evenodd" fill="currentColor"/>` },
  analytics: { y: 176, html: `<path d="M31.25 184.625C31.25 184.349 31.4739 184.125 31.75 184.125H35.5C35.7761 184.125 36 184.349 36 184.625C36 184.901 35.7761 185.125 35.5 185.125H32.25V190.25C32.25 190.526 32.0261 190.75 31.75 190.75C31.4739 190.75 31.25 190.526 31.25 190.25V184.625Z" fill-rule="evenodd" clip-rule="evenodd" fill="currentColor"/><path d="M30 190.25C30 189.974 30.2239 189.75 30.5 189.75H45.5C45.7761 189.75 46 189.974 46 190.25C46 190.526 45.7761 190.75 45.5 190.75H30.5C30.2239 190.75 30 190.526 30 190.25Z" fill-rule="evenodd" clip-rule="evenodd" fill="currentColor"/><path d="M35 180.875C35 180.599 35.2239 180.375 35.5 180.375H39.875C40.1511 180.375 40.375 180.599 40.375 180.875C40.375 181.151 40.1511 181.375 39.875 181.375H36V190.25C36 190.526 35.7761 190.75 35.5 190.75C35.2239 190.75 35 190.526 35 190.25V180.875Z" fill-rule="evenodd" clip-rule="evenodd" fill="currentColor"/><path d="M39.375 177.125C39.375 176.849 39.5989 176.625 39.875 176.625H44.25C44.5261 176.625 44.75 176.849 44.75 177.125V190.25C44.75 190.526 44.5261 190.75 44.25 190.75C43.9739 190.75 43.75 190.526 43.75 190.25V177.625H40.375V190.25C40.375 190.526 40.1511 190.75 39.875 190.75C39.5989 190.75 39.375 190.526 39.375 190.25V177.125Z" fill-rule="evenodd" clip-rule="evenodd" fill="currentColor"/>` },
  protection: { y: 224, html: `<path d="M31.75 229.375C31.681 229.375 31.625 229.431 31.625 229.5V238.25C31.625 238.319 31.681 238.375 31.75 238.375H44.25C44.319 238.375 44.375 238.319 44.375 238.25V229.5C44.375 229.431 44.319 229.375 44.25 229.375H31.75ZM30.625 229.5C30.625 228.879 31.1287 228.375 31.75 228.375H44.25C44.8713 228.375 45.375 228.879 45.375 229.5V238.25C45.375 238.871 44.8713 239.375 44.25 239.375H31.75C31.1287 239.375 30.625 238.871 30.625 238.25V229.5Z" fill-rule="evenodd" clip-rule="evenodd" fill="currentColor"/><path d="M38 234.5C38.3452 234.5 38.625 234.22 38.625 233.875C38.625 233.53 38.3452 233.25 38 233.25C37.6548 233.25 37.375 233.53 37.375 233.875C37.375 234.22 37.6548 234.5 38 234.5Z" fill="currentColor"/><path d="M38 223.75C37.3038 223.75 36.6361 224.027 36.1438 224.519C35.6516 225.011 35.375 225.679 35.375 226.375V228.875C35.375 229.151 35.1511 229.375 34.875 229.375C34.5989 229.375 34.375 229.151 34.375 228.875V226.375C34.375 225.414 34.7569 224.492 35.4367 223.812C36.1166 223.132 37.0386 222.75 38 222.75C38.9614 222.75 39.8834 223.132 40.5633 223.812C41.2431 224.492 41.625 225.414 41.625 226.375V228.875C41.625 229.151 41.4011 229.375 41.125 229.375C40.8489 229.375 40.625 229.151 40.625 228.875V226.375C40.625 225.679 40.3484 225.011 39.8562 224.519C39.3639 224.027 38.6962 223.75 38 223.75Z" fill-rule="evenodd" clip-rule="evenodd" fill="currentColor"/>` },
  orchestration: { y: 272, html: `<path d="M40.95 275.75C40.2873 275.75 39.75 276.287 39.75 276.95C39.75 277.613 40.2873 278.15 40.95 278.15C41.6127 278.15 42.15 277.613 42.15 276.95C42.15 276.287 41.6127 275.75 40.95 275.75ZM38.75 276.95C38.75 275.735 39.735 274.75 40.95 274.75C42.165 274.75 43.15 275.735 43.15 276.95C43.15 278.165 42.165 279.15 40.95 279.15C39.735 279.15 38.75 278.165 38.75 276.95Z" fill-rule="evenodd" clip-rule="evenodd" fill="currentColor"/><path d="M39.6697 272.017C39.8227 271.976 39.9858 272.011 40.1094 272.109L40.9421 272.775C40.9801 272.774 41.0181 272.774 41.0561 272.775L41.8889 272.11C42.0127 272.011 42.176 271.977 42.3292 272.017C42.768 272.134 43.1895 272.308 43.5824 272.536C43.7197 272.615 43.8111 272.755 43.8288 272.912L43.9478 273.972C43.975 273.998 44.0018 274.025 44.0283 274.052L45.0871 274.171C45.2445 274.189 45.3842 274.28 45.4637 274.417C45.6917 274.81 45.8664 275.231 45.9832 275.67C46.024 275.823 45.9896 275.987 45.8906 276.111L45.2252 276.944C45.2257 276.982 45.2257 277.02 45.2252 277.058L45.8902 277.89C45.9889 278.014 46.0233 278.177 45.983 278.33C45.8673 278.769 45.6939 279.19 45.4673 279.583C45.3879 279.721 45.2478 279.812 45.0899 279.83L44.0307 279.949C44.0042 279.976 43.9773 280.003 43.9501 280.03L43.8311 281.089C43.8134 281.246 43.7223 281.386 43.5853 281.465C43.1925 281.693 42.7711 281.868 42.3322 281.985C42.179 282.025 42.0154 281.991 41.8915 281.892L41.0588 281.227C41.0208 281.227 40.9828 281.227 40.9448 281.227L40.1121 281.892C39.9885 281.99 39.8255 282.025 39.6726 281.984C39.2338 281.869 38.8124 281.695 38.4193 281.469C38.2816 281.389 38.1899 281.249 38.1721 281.091L38.0532 280.032C38.0256 280.005 37.9985 279.978 37.9717 279.951L36.9105 279.826C36.7541 279.808 36.6154 279.717 36.5363 279.581C36.3083 279.188 36.1336 278.766 36.0168 278.328C35.976 278.174 36.0104 278.011 36.1094 277.887L36.7748 277.054C36.7743 277.016 36.7743 276.978 36.7748 276.94L36.1098 276.107C36.0109 275.984 35.9766 275.82 36.0172 275.667C36.1337 275.228 36.308 274.807 36.5355 274.414C36.615 274.277 36.7548 274.185 36.9124 274.167L37.9717 274.049C37.9982 274.021 38.025 273.994 38.0522 273.968L38.1712 272.909C38.1889 272.751 38.2806 272.611 38.4182 272.532C38.8107 272.305 39.2316 272.132 39.6697 272.017ZM39.1357 273.281L39.0253 274.264C39.0115 274.386 38.9528 274.5 38.8604 274.582C38.7633 274.668 38.6715 274.76 38.5854 274.857C38.5034 274.949 38.3901 275.008 38.2673 275.022L37.2838 275.132C37.1938 275.311 37.1171 275.497 37.0541 275.687L37.6717 276.461C37.7488 276.557 37.7875 276.679 37.7802 276.802C37.7725 276.932 37.7725 277.062 37.7802 277.192C37.7875 277.315 37.7488 277.437 37.6717 277.534L37.0538 278.307C37.117 278.498 37.1941 278.684 37.2845 278.863L38.2706 278.979C38.3925 278.993 38.5049 279.052 38.5864 279.143C38.6725 279.24 38.7643 279.332 38.8613 279.418C38.9537 279.5 39.0125 279.614 39.0263 279.736L39.1367 280.719C39.3159 280.809 39.5014 280.885 39.6916 280.948L40.4655 280.33C40.5621 280.253 40.6837 280.214 40.8071 280.221C40.9368 280.229 41.0669 280.229 41.1967 280.221C41.3201 280.214 41.4418 280.253 41.5383 280.33L42.3116 280.948C42.5019 280.885 42.6874 280.808 42.8665 280.718L42.977 279.734C42.9908 279.611 43.0496 279.498 43.142 279.416C43.239 279.33 43.3308 279.238 43.4169 279.141C43.4989 279.049 43.6123 278.99 43.7351 278.976L44.718 278.866C44.8074 278.686 44.8837 278.501 44.9463 278.311L44.3283 277.537C44.2512 277.44 44.2126 277.319 44.2198 277.195C44.2275 277.066 44.2275 276.935 44.2198 276.806C44.2125 276.682 44.2512 276.561 44.3284 276.464L44.9462 275.691C44.8832 275.5 44.8063 275.315 44.7162 275.136L43.7327 275.025C43.6099 275.012 43.4966 274.953 43.4146 274.86C43.3285 274.763 43.2367 274.672 43.1397 274.585C43.0472 274.503 42.9885 274.39 42.9747 274.267L42.8642 273.284C42.6849 273.194 42.4993 273.117 42.3089 273.054L41.5354 273.672C41.4389 273.749 41.3172 273.787 41.1939 273.78C41.0641 273.772 40.934 273.772 40.8043 273.78C40.6809 273.787 40.5592 273.749 40.4626 273.672L39.6888 273.053C39.4992 273.116 39.3143 273.192 39.1357 273.281Z" fill-rule="evenodd" clip-rule="evenodd" fill="currentColor"/><path d="M33.95 283.25C33.5634 283.25 33.25 283.563 33.25 283.95C33.25 284.337 33.5634 284.65 33.95 284.65C34.3366 284.65 34.65 284.337 34.65 283.95C34.65 283.563 34.3366 283.25 33.95 283.25ZM32.25 283.95C32.25 283.011 33.0111 282.25 33.95 282.25C34.8889 282.25 35.65 283.011 35.65 283.95C35.65 284.889 34.8889 285.65 33.95 285.65C33.0111 285.65 32.25 284.889 32.25 283.95Z" fill-rule="evenodd" clip-rule="evenodd" fill="currentColor"/><path d="M32.937 280.017C33.09 279.976 33.2531 280.011 33.3767 280.109L33.9936 280.602C33.9974 280.602 34.0012 280.602 34.0051 280.602L34.622 280.11C34.7458 280.011 34.9092 279.976 35.0623 280.017C35.4132 280.11 35.7501 280.25 36.0642 280.431C36.2015 280.511 36.2929 280.651 36.3106 280.808L36.3987 281.593C36.4015 281.596 36.4042 281.599 36.4069 281.601L37.1913 281.689C37.3487 281.707 37.4883 281.798 37.5679 281.935C37.7502 282.249 37.8899 282.586 37.9832 282.937C38.024 283.09 37.9896 283.254 37.8906 283.378L37.3977 283.995C37.3977 283.998 37.3977 284.002 37.3977 284.006L37.8903 284.623C37.989 284.747 38.0234 284.91 37.9831 285.063C37.8906 285.413 37.752 285.75 37.5708 286.065C37.4914 286.202 37.3514 286.294 37.1934 286.312L36.4087 286.4C36.406 286.403 36.4033 286.405 36.4005 286.408L36.3124 287.192C36.2947 287.35 36.2035 287.489 36.0666 287.569C35.7525 287.751 35.4156 287.891 35.0647 287.984C34.9115 288.025 34.748 287.991 34.6241 287.892L34.0072 287.399C34.0033 287.399 33.9995 287.399 33.9957 287.399L33.3787 287.891C33.2551 287.99 33.0921 288.025 32.9392 287.984C32.5885 287.892 32.2516 287.753 31.9373 287.572C31.7996 287.493 31.7079 287.352 31.6901 287.195L31.602 286.41C31.5989 286.407 31.5959 286.404 31.5929 286.401L30.8064 286.309C30.6499 286.29 30.5112 286.199 30.4322 286.063C30.2498 285.749 30.1102 285.412 30.0168 285.061C29.976 284.908 30.0104 284.744 30.1094 284.62L30.6023 284.004C30.6023 284 30.6023 283.996 30.6023 283.992L30.1097 283.375C30.0108 283.251 29.9764 283.088 30.0171 282.935C30.1103 282.584 30.2496 282.247 30.4315 281.933C30.5109 281.796 30.6508 281.704 30.8084 281.687L31.5931 281.598C31.5958 281.596 31.5986 281.593 31.6013 281.59L31.6894 280.806C31.7072 280.648 31.7988 280.508 31.9364 280.429C32.2502 280.248 32.5867 280.109 32.937 280.017ZM32.6536 281.181L32.5746 281.884C32.5608 282.007 32.502 282.12 32.4096 282.202C32.3374 282.266 32.2691 282.335 32.2051 282.407C32.1231 282.499 32.0097 282.558 31.887 282.572L31.1826 282.651C31.1349 282.751 31.0925 282.853 31.0558 282.957L31.4982 283.511C31.5753 283.608 31.6139 283.73 31.6066 283.853C31.6009 283.949 31.6009 284.046 31.6066 284.143C31.6139 284.266 31.5752 284.388 31.4981 284.484L31.0556 285.038C31.0926 285.143 31.1352 285.246 31.1832 285.346L31.89 285.429C32.012 285.443 32.1243 285.502 32.2058 285.593C32.2699 285.665 32.3382 285.734 32.4103 285.798C32.5027 285.88 32.5615 285.993 32.5753 286.116L32.6543 286.82C32.7541 286.867 32.8563 286.909 32.9605 286.946L33.515 286.503C33.6115 286.426 33.7332 286.387 33.8565 286.394C33.9531 286.4 34.0499 286.4 34.1464 286.394C34.2698 286.387 34.3915 286.426 34.4881 286.503L35.0419 286.946C35.1461 286.909 35.2484 286.866 35.3481 286.819L35.4273 286.114C35.4411 285.991 35.4998 285.878 35.5922 285.796C35.6644 285.732 35.7327 285.664 35.7967 285.592C35.8787 285.499 35.9921 285.44 36.1149 285.427L36.8186 285.347C36.866 285.248 36.9081 285.146 36.9446 285.041L36.5018 284.487C36.4247 284.39 36.3861 284.269 36.3934 284.145C36.3991 284.049 36.3991 283.952 36.3934 283.855C36.3861 283.732 36.4248 283.61 36.5019 283.514L36.9444 282.96C36.9076 282.856 36.8652 282.753 36.8175 282.654L36.113 282.575C35.9903 282.561 35.8769 282.502 35.7949 282.41C35.7309 282.337 35.6626 282.269 35.5904 282.205C35.498 282.123 35.4392 282.01 35.4255 281.887L35.3463 281.183C35.2465 281.135 35.1441 281.093 35.0398 281.056L34.4858 281.498C34.3892 281.575 34.2676 281.614 34.1442 281.607C34.0477 281.601 33.9509 281.601 33.8543 281.607C33.7309 281.614 33.6092 281.575 33.5127 281.498L32.9583 281.055C32.8546 281.091 32.7529 281.133 32.6536 281.181Z" fill-rule="evenodd" clip-rule="evenodd" fill="currentColor"/>` },
  monitoring: { y: 320, html: `<path d="M35.5 332.5C35.7762 332.5 36 332.724 36 333C36 333.53 36.2107 334.039 36.5858 334.414C36.9609 334.789 37.4696 335 38 335C38.5305 335 39.0392 334.789 39.4142 334.414C39.7893 334.039 40 333.53 40 333C40 332.724 40.2239 332.5 40.5 332.5C40.7762 332.5 41 332.724 41 333C41 333.796 40.684 334.559 40.1213 335.121C39.5587 335.684 38.7957 336 38 336C37.2044 336 36.4413 335.684 35.8787 335.121C35.3161 334.559 35 333.796 35 333C35 332.724 35.2239 332.5 35.5 332.5Z" fill-rule="evenodd" clip-rule="evenodd" fill="currentColor"/><path d="M38 321C36.6408 321 35.3372 321.54 34.3761 322.501C33.415 323.462 32.875 324.766 32.875 326.125C32.875 328.977 32.2183 331.322 31.6454 332.313C31.6345 332.332 31.6288 332.353 31.6288 332.375C31.6288 332.397 31.6345 332.418 31.6453 332.437C31.6562 332.456 31.6719 332.472 31.6908 332.483C31.7094 332.494 31.7306 332.5 31.7521 332.5H44.2488C44.2705 332.5 44.2918 332.494 44.3106 332.483C44.3295 332.472 44.3453 332.456 44.3562 332.437C44.3671 332.418 44.3728 332.397 44.3728 332.375C44.3728 332.353 44.367 332.331 44.3561 332.313C43.7823 331.321 43.125 328.978 43.125 326.125C43.125 324.766 42.5851 323.462 41.6239 322.501C40.6628 321.54 39.3593 321 38 321ZM33.669 321.794C34.8177 320.645 36.3756 320 38 320C39.6245 320 41.1824 320.645 42.3311 321.794C43.4797 322.943 44.125 324.501 44.125 326.125C44.125 328.869 44.7644 331.022 45.2218 331.812C45.3204 331.983 45.3726 332.177 45.3728 332.374C45.373 332.571 45.3214 332.765 45.2231 332.936C45.1248 333.107 44.9834 333.249 44.8129 333.348C44.6424 333.447 44.4489 333.499 44.2518 333.5L44.25 333.5H31.747C31.5501 333.499 31.357 333.446 31.1869 333.347C31.0168 333.248 30.8758 333.105 30.7778 332.935C30.6799 332.764 30.6285 332.57 30.6288 332.373C30.6291 332.176 30.6811 331.983 30.7795 331.812C31.2363 331.022 31.875 328.868 31.875 326.125C31.875 324.501 32.5203 322.943 33.669 321.794Z" fill-rule="evenodd" clip-rule="evenodd" fill="currentColor"/>` },
  chevR: { x: 223, y: 124, html: `<path d="M228.16 136.854C227.947 136.658 227.947 136.342 228.16 136.146L232.683 132L228.16 127.854C227.947 127.658 227.947 127.342 228.16 127.146C228.373 126.951 228.718 126.951 228.931 127.146L233.84 131.646C234.053 131.842 234.053 132.158 233.84 132.354L228.931 136.854C228.718 137.049 228.373 137.049 228.16 136.854Z" fill-rule="evenodd" clip-rule="evenodd" fill="currentColor"/>` },
  chevL: { x: 75, y: 80, html: `<path d="M85.8402 83.1464C86.0533 83.3417 86.0533 83.6583 85.8402 83.8536L81.3168 88L85.8402 92.1464C86.0533 92.3417 86.0533 92.6583 85.8402 92.8536C85.6272 93.0488 85.2819 93.0488 85.0689 92.8536L80.1598 88.3536C79.9467 88.1583 79.9467 87.8417 80.1598 87.6464L85.0689 83.1464C85.2819 82.9512 85.6272 82.9512 85.8402 83.1464Z" fill-rule="evenodd" clip-rule="evenodd" fill="currentColor"/>` },
  ext: { x: 222, y: 268, html: `<path d="M237.229 268.771C237.424 268.967 237.424 269.283 237.229 269.479L230.979 275.729C230.783 275.924 230.467 275.924 230.271 275.729C230.076 275.533 230.076 275.217 230.271 275.021L236.521 268.771C236.717 268.576 237.033 268.576 237.229 268.771Z" fill-rule="evenodd" clip-rule="evenodd" fill="currentColor"/><path d="M231.375 269.125C231.375 268.849 231.599 268.625 231.875 268.625L236.874 268.626C237.15 268.626 237.374 268.85 237.374 269.126L237.375 274.125C237.375 274.401 237.151 274.625 236.875 274.625C236.599 274.625 236.375 274.401 236.375 274.125L236.374 269.626L231.875 269.625C231.599 269.625 231.375 269.401 231.375 269.125Z" fill-rule="evenodd" clip-rule="evenodd" fill="currentColor"/><path d="M223.75 272.125C223.717 272.125 223.685 272.138 223.662 272.162C223.638 272.185 223.625 272.217 223.625 272.25V282.25C223.625 282.283 223.638 282.315 223.662 282.338C223.685 282.362 223.717 282.375 223.75 282.375H233.75C233.783 282.375 233.815 282.362 233.838 282.338C233.862 282.315 233.875 282.283 233.875 282.25V276.625C233.875 276.349 234.099 276.125 234.375 276.125C234.651 276.125 234.875 276.349 234.875 276.625V282.25C234.875 282.548 234.756 282.835 234.545 283.045C234.335 283.256 234.048 283.375 233.75 283.375H223.75C223.452 283.375 223.165 283.256 222.955 283.045C222.744 282.835 222.625 282.548 222.625 282.25V272.25C222.625 271.952 222.744 271.665 222.955 271.455C223.165 271.244 223.452 271.125 223.75 271.125H229.375C229.651 271.125 229.875 271.349 229.875 271.625C229.875 271.901 229.651 272.125 229.375 272.125H223.75Z" fill-rule="evenodd" clip-rule="evenodd" fill="currentColor"/>` },
  administration: { y: 368, html: `<path d="M38.05 373.425C36.6003 373.425 35.425 374.6 35.425 376.05C35.425 377.5 36.6003 378.675 38.05 378.675C39.4998 378.675 40.675 377.5 40.675 376.05C40.675 374.6 39.4998 373.425 38.05 373.425ZM34.425 376.05C34.425 374.048 36.048 372.425 38.05 372.425C40.052 372.425 41.675 374.048 41.675 376.05C41.675 378.052 40.052 379.675 38.05 379.675C36.048 379.675 34.425 378.052 34.425 376.05Z" fill-rule="evenodd" clip-rule="evenodd" fill="currentColor"/><path d="M35.9068 368.017C36.0598 367.976 36.2229 368.011 36.3465 368.109L37.8404 369.303C37.9812 369.299 38.1221 369.299 38.2629 369.303L39.7567 368.11C39.8806 368.011 40.0439 367.977 40.1971 368.018C40.9046 368.205 41.5841 368.486 42.2177 368.853C42.355 368.933 42.4464 369.073 42.4641 369.23L42.6775 371.13C42.78 371.227 42.8796 371.326 42.976 371.429L44.8754 371.642C45.0327 371.66 45.1724 371.751 45.2519 371.888C45.6196 372.521 45.9012 373.201 46.0895 373.908C46.1302 374.061 46.0959 374.225 45.9969 374.349L44.8032 375.843C44.8075 375.984 44.8075 376.124 44.8032 376.265L45.9962 377.759C46.0949 377.883 46.1293 378.046 46.0889 378.199C45.9024 378.906 45.6228 379.585 45.2574 380.219C45.178 380.357 45.038 380.449 44.88 380.466L42.9799 380.68C42.8835 380.782 42.7839 380.882 42.6814 380.978L42.468 382.878C42.4503 383.035 42.3591 383.175 42.2221 383.254C41.5889 383.622 40.9096 383.904 40.202 384.092C40.0487 384.133 39.8852 384.098 39.7613 383.999L38.2675 382.806C38.1267 382.81 37.9858 382.81 37.845 382.806L36.3511 383.999C36.2275 384.097 36.0645 384.132 35.9116 384.091C35.2042 383.905 34.5247 383.625 33.8909 383.26C33.7532 383.18 33.6615 383.04 33.6438 382.882L33.4303 380.982C33.3274 380.886 33.2276 380.786 33.1309 380.683L31.2286 380.46C31.0721 380.442 30.9334 380.351 30.8543 380.214C30.4867 379.581 30.205 378.902 30.0168 378.194C29.976 378.041 30.0104 377.877 30.1094 377.754L31.3031 376.26C31.2987 376.119 31.2987 375.978 31.3031 375.837L30.1101 374.343C30.0112 374.219 29.9769 374.056 30.0175 373.903C30.2054 373.195 30.4864 372.516 30.8532 371.882C30.9327 371.745 31.0725 371.654 31.2301 371.636L33.1303 371.423C33.2267 371.32 33.3262 371.22 33.4288 371.124L33.6422 369.225C33.6599 369.067 33.7516 368.927 33.8892 368.847C34.522 368.482 35.2005 368.203 35.9068 368.017ZM34.6071 369.593L34.4016 371.422C34.3878 371.545 34.329 371.658 34.2366 371.74C34.0637 371.894 33.9001 372.057 33.7466 372.23C33.6646 372.323 33.5513 372.382 33.4285 372.395L31.5976 372.601C31.3729 373.022 31.1901 373.464 31.052 373.92L32.2016 375.36C32.2787 375.456 32.3174 375.578 32.3101 375.701C32.2964 375.933 32.2964 376.164 32.3101 376.395C32.3174 376.519 32.2787 376.641 32.2016 376.737L31.0513 378.177C31.1899 378.633 31.3732 379.076 31.5987 379.496L33.4324 379.711C33.5543 379.725 33.6667 379.784 33.7482 379.876C33.9016 380.049 34.0653 380.212 34.2382 380.366C34.3306 380.448 34.3893 380.561 34.4031 380.684L34.6087 382.514C35.0295 382.738 35.4713 382.92 35.9276 383.057L37.3677 381.907C37.4642 381.83 37.5859 381.791 37.7092 381.799C37.9404 381.812 38.1721 381.812 38.4033 381.799C38.5267 381.791 38.6484 381.83 38.7449 381.907L40.1844 383.057C40.6408 382.919 41.0825 382.736 41.5029 382.511L41.7086 380.68C41.7224 380.557 41.7812 380.444 41.8736 380.362C42.0465 380.209 42.2101 380.045 42.3636 379.872C42.4456 379.78 42.5589 379.721 42.6817 379.707L44.512 379.501C44.7356 379.081 44.9174 378.639 45.0546 378.183L43.9046 376.742C43.8275 376.646 43.7889 376.524 43.7962 376.401C43.8099 376.17 43.8099 375.938 43.7962 375.707C43.7889 375.584 43.8275 375.462 43.9047 375.365L45.0549 373.926C44.9165 373.469 44.7334 373.028 44.5083 372.607L42.6778 372.402C42.555 372.388 42.4417 372.329 42.3597 372.237C42.2062 372.064 42.0426 371.9 41.8697 371.747C41.7772 371.665 41.7185 371.551 41.7047 371.428L41.4991 369.598C41.0783 369.373 40.6364 369.19 40.1798 369.052L38.7401 370.202C38.6436 370.279 38.5219 370.317 38.3986 370.31C38.1674 370.296 37.9357 370.296 37.7045 370.31C37.5812 370.317 37.4594 370.279 37.3629 370.202L35.9229 369.051C35.4676 369.188 35.0269 369.369 34.6071 369.593Z" fill-rule="evenodd" clip-rule="evenodd" fill="currentColor"/>` },
};
/* the VSP 360 navigation as drawn. An item: { key, label, icon, menu? }; a menu is { items } or { groups: [[label or null, pages]] };
   a menu item with items or groups drills down to a 2nd level; external: opens outside the app (never selected) */
export const VSP360_NAVIGATION = [
  { key: "dashboard", label: "Dashboard", icon: "dashboard" },
  { key: "inventory", label: "Inventory", icon: "inventory", menu: { groups: [["Storage", ["Block", "Object", "File", "SDS"]], ["Virtualization", ["VMware", "Hyper-V"]], ["Hosts", ["Linux", "Windows"]], [null, ["Switches"]]] } },
  { key: "analytics", label: "Analytics", icon: "analytics", menu: { items: [
    { label: "Health", groups: [["Storage", ["Block"]], ["Virtualization", ["VMware", "Hyper-V"]], ["Hosts", ["Linux", "Windows"]], [null, ["Switches"]]] },
    { label: "Performance", groups: [["Storage", ["Block", "Object", "File", "SDS"]], ["Virtualization", ["VMware", "Hyper-V"]], ["Hosts", ["Linux", "Windows"]], [null, ["Switches"]]] },
    { label: "Capacity", groups: [["Storage", ["Block", "Object", "File"]], ["Virtualization", ["VMware", "Hyper-V"]], ["Hosts", ["Windows"]], [null, ["Switches"]]] },
    { label: "Applications" }, { label: "Data Reduction" }, { label: "Insights" }, { label: "Reporting" }, { label: "Data Protection" },
  ] } },
  { key: "protection", label: "Protection", icon: "protection", menu: { items: [{ label: "Local Protection" }, { label: "Remote Protection" }, { label: "External Replication" }] } },
  { key: "orchestration", label: "Orchestration", icon: "orchestration", menu: { items: [{ label: "Overview" }, { label: "Workflow Catalog" }, { label: "Insights" }, { label: "Ansible", external: true }] } },
  { key: "monitoring", label: "Monitoring", icon: "monitoring", menu: { items: [{ label: "Storage Alerts" }, { label: "System Alerts" }, { label: "System Info" }, { label: "Jobs" }, { label: "Logs" }, { label: "Diagnostic Tool" }] } },
  { key: "administration", label: "Administration", icon: "administration", menu: { items: [
    { label: "Users & Access", items: [{ label: "Users" }, { label: "Groups" }, { label: "Roles" }, { label: "Service Accounts" }] },
    { label: "Authentication", items: [{ label: "Identity Provider" }, { label: "Active Directory" }, { label: "Certificates" }] },
    { label: "Operations", items: [{ label: "Probes" }, { label: "Monitored Window" }, { label: "Thresholds" }, { label: "Alert Profiles" }, { label: "SMTP Notifications" }, { label: "SNMP Notifications" }] },
    { label: "Settings", items: [{ label: "Report Parameters" }, { label: "General Settings" }, { label: "Tier Management" }] },
    { label: "Device Registry" }, { label: "Software Update" }, { label: "Backup and Restore" },
  ] } },
];
const navTop = (items, k) => items.find((x) => x.key === k) || null;
/* the labels of a path, e.g. ["analytics", "Capacity", "Storage", "Block"] → Analytics, Capacity, Storage, Block */
export const navPathLabels = (path, items = VSP360_NAVIGATION) => { const t = navTop(items, path[0]); return [t ? t.label : path[0], ...path.slice(1).filter(Boolean)]; };
const NavIcon = ({ k, className = "" }) => {
  const ic = NAV_ICONS[k];
  if (!ic) return null;
  return <svg className={`hvn-ico ${className}`} viewBox={`${ic.x ?? 30} ${ic.y} 16 16`} fill="none" aria-hidden="true" dangerouslySetInnerHTML={{ __html: ic.html }} />;
};
const navIconOf = (it) => (typeof it.icon === "string" ? <NavIcon k={it.icon} /> : it.icon ? <span className="hvn-ico">{it.icon}</span> : <span className="hvn-ico" />);
const samePath = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);
const startsWith = (a, b) => b.every((x, i) => a[i] === x);
const navReduce = () => typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
/* the drill-down panel: level 1 lists the section's pages (a caret where there is a level 2); level 2 has a back row */
function NavPanel({ top, sub, dir, active, onSub, onPick, onExternal, floating, closing, onClosed, origin }) {
  const menu = top.menu;
  const node = sub != null ? (menu.items || []).find((x) => x.label === sub) : null;
  const panelRef = useRef(null);
  const [pending, setPending] = useState(null); // on press the selection moves to the pressed page; leaving while pressed puts it back; release chooses
  const press = useRef(null);
  const shown = pending || active;
  useLayoutEffect(() => { // the selection grows from a line on the pressed item while the old one closes, as in the dropdowns (no overshoot)
    const p = press.current; press.current = null;
    if (!p || !p.to.animate || navReduce()) return;
    const line = (el) => Math.min(1, 2 / Math.max(1, el.offsetHeight));
    const opt = { duration: 360, easing: "cubic-bezier(.3,0,.2,1)" };
    try {
      ["::after", "::before"].forEach((pe) => p.to.animate([{ transform: `scaleY(${line(p.to)})`, opacity: 0.6 }, { transform: "scaleY(1)", opacity: 1 }], { ...opt, pseudoElement: pe }));
      if (p.from && p.from !== p.to && p.from.isConnected) {
        const old = p.from; old.setAttribute("data-unpick", "");
        const anims = ["::after", "::before"].map((pe) => old.animate([{ transform: "scaleY(1)", opacity: 1 }, { transform: `scaleY(${line(old)})`, opacity: 0 }], { ...opt, pseudoElement: pe, fill: "forwards" }));
        anims[0].onfinish = anims[0].oncancel = () => { old.removeAttribute("data-unpick"); anims.forEach((a) => a.cancel()); };
      }
    } catch (err) { /* no pseudo-element animation here: the selection just moves */ }
  }, [pending]);
  const fold = (dirIn) => { // a floating panel grows out of the icon that opened it and folds back into it; inside the bar it fades
    const el = panelRef.current;
    if (!el || !el.animate || navReduce()) return null;
    el.style.transformOrigin = origin || "0 0";
    const k = floating ? [{ transform: "scale(.4)", opacity: 0 }, { transform: "scale(1)", opacity: 1 }] : [{ opacity: 0 }, { opacity: 1 }];
    return el.animate(dirIn ? k : k.reverse(), { duration: 200, easing: "cubic-bezier(.4,0,.2,1)", fill: dirIn ? "none" : "forwards" });
  };
  useLayoutEffect(() => { if (floating) fold(true); }, []);
  useEffect(() => {
    if (!closing) return undefined;
    const a = fold(false);
    if (!a) { onClosed(); return undefined; }
    a.onfinish = onClosed;
    return () => { a.onfinish = null; };
  }, [closing]);
  const leaf = (path, t, cls, external) => {
    if (external) return ( // opens outside the app: not a page here, so it never takes the selection
      <button key={t} type="button" className={`hvn-item hvn-pitem ${cls}`} aria-label={`${t} (opens in a new tab)`} onClick={() => onExternal && onExternal(path)}>
        <span className="hvn-label">{t}</span><NavIcon k="ext" className="hvn-caret hvn-ext" />
      </button>
    );
    return (
      <button key={t} type="button" className={`hvn-item hvn-pitem ${cls}${samePath(shown, path) ? " is-active" : ""}`} aria-current={samePath(active, path) ? "page" : undefined}
              onPointerDown={(e) => {
                if (e.button !== 0 || samePath(shown, path)) return;
                press.current = { from: panelRef.current && panelRef.current.querySelector(".hvn-pitem.is-active"), to: e.currentTarget };
                setPending(path);
              }}
              onPointerLeave={(e) => { if (pending && samePath(pending, path) && e.buttons) setPending(null); }}
              onClick={() => { setPending(null); onPick(path); }}>
        <span className="hvn-label">{t}</span>
      </button>
    );
  };
  const list = (n, pre) => n.groups ? n.groups.map(([g, l], i) => ( // grouped: labels, rules, indented pages
    <div key={i} className={`hvn-pgroup${i ? " has-rule" : ""}${g ? "" : " no-label"}`} role="group" aria-label={g || undefined}>
      {g && <div className="hvn-pglabel">{g}</div>}
      {l.map((t) => leaf([...pre, g || "", t], t, "is-l2"))}
    </div>
  )) : (n.items || []).map((it) => it.items || it.groups ? (
    <button key={it.label} type="button" className={`hvn-item hvn-pitem${startsWith(active, [...pre, it.label]) ? " is-trail" : ""}`} aria-haspopup="menu" onClick={() => onSub(it.label)}>
      <span className="hvn-label">{it.label}</span><NavIcon k="chevR" className="hvn-caret" />
    </button>
  ) : leaf([...pre, it.label], it.label, "", it.external));
  return (
    <div ref={panelRef} className={`hvn-panel${floating ? " is-float" : ""}`} role="menu" aria-label={node ? node.label : top.label}>
      <div key={sub ?? "-"} className={`hvn-level${dir ? ` is-${dir}` : ""}`}>
        {node ? (
          <>
            <button type="button" className="hvn-phead is-back" onClick={() => onSub(null)} aria-label={`Back to ${top.label}`}>
              <NavIcon k="chevL" /><span>{node.label}</span>
            </button>
            <div className="hvn-psep" />
            <div className={`hvn-plist${node.items ? " is-tight" : ""}`}>{list(node, [top.key, node.label])}</div>
          </>
        ) : (
          <>
            <div className="hvn-phead">{top.label}</div>
            <div className="hvn-psep" />
            <div className="hvn-plist">{list(menu, [top.key])}</div>
          </>
        )}
      </div>
    </div>
  );
}
/* the navigation's state: what is selected (a path) and which menu is open */
function useNav({ items, active, setActive, setCollapsed }) {
  const [open, setOpen] = useState(null); // { id, top, sub, dir, floating, temp, closing }
  const hasMenu = (k) => { const t = navTop(items, k); return !!(t && t.menu); };
  const retract = (o) => { if (o && o.temp) setCollapsed(true); return { ...o, closing: true }; }; // opened from the collapsed bar: the bar folds back
  const close = (now) => setOpen((o) => (!o ? o : (o.floating || o.temp) && !now ? retract(o) : null));
  const closed = () => setOpen((o) => (o && o.closing ? null : o));
  const pickTop = (k, collapsed) => {
    if (hasMenu(k) && collapsed) { // from the collapsed bar: the bar opens with this section's menu
      setCollapsed(false);
      setOpen({ id: Date.now(), top: k, sub: null, dir: null, floating: false, temp: true });
      return;
    }
    if (hasMenu(k)) setOpen((o) => (o && o.top === k && !o.closing ? (o.temp ? retract(o) : null) : { id: Date.now(), top: k, sub: null, dir: null, floating: false, temp: !!(o && o.temp) }));
    else { setActive([k]); setOpen((o) => { if (o && o.temp) setCollapsed(true); return null; }); }
  };
  const onSub = (sub) => setOpen((o) => ({ ...o, sub, dir: sub == null ? "back" : "fwd" }));
  const onPick = (path) => { // the menu stays where it is once a page is chosen (also when it was opened from the collapsed bar)
    setActive(path);
    setOpen((o) => (o && o.floating ? retract(o) : o && o.temp ? { ...o, temp: false } : o));
  };
  return { active, open, close, closed, pickTop, onSub, onPick };
}
/* Navigation: the vertical bar (271px open, 77px collapsed). A section with pages opens its drill-down menu inside the bar,
   the bar dropping to its icons meanwhile; tooltips wherever a label is hidden. Controlled or not: value / onNavigate, collapsed / onCollapsedChange. */
export function Navigation({
  items = VSP360_NAVIGATION, value, defaultValue, onNavigate, onExternal,
  collapsed, defaultCollapsed = false, onCollapsedChange, theme = "dawn", className = "", style,
}) {
  const [valueIn, setValueIn] = useState(defaultValue || [items[0] ? items[0].key : ""]);
  const active = value || valueIn;
  const setActive = (p) => { if (value === undefined) setValueIn(p); if (onNavigate) onNavigate(p); };
  const [colIn, setColIn] = useState(defaultCollapsed);
  const isCol = collapsed === undefined ? colIn : collapsed;
  const setCol = (c) => { if (collapsed === undefined) setColIn(c); if (onCollapsedChange) onCollapsedChange(c); };
  const nav = useNav({ items, active, setActive, setCollapsed: setCol });
  const rootRef = useRef(null);
  const tip = useTips(rootRef, ".hvn-root");
  useEffect(() => { if (nav.open && !nav.open.temp) nav.close(true); }, [isCol]); // collapsing or opening the bar from outside closes a menu
  useEffect(() => { // Esc closes an open menu; a click outside closes one opened from the collapsed bar
    if (!nav.open || nav.open.closing) return undefined;
    const down = (e) => { if (nav.open.temp && rootRef.current && !rootRef.current.contains(e.target)) nav.close(); };
    const key = (e) => { if (e.key === "Escape") { const k = nav.open.top; nav.close(); const b = rootRef.current && rootRef.current.querySelector(`[data-nav="${k}"]`); if (b) b.focus(); } };
    document.addEventListener("pointerdown", down); document.addEventListener("keydown", key);
    return () => { document.removeEventListener("pointerdown", down); document.removeEventListener("keydown", key); };
  }, [nav.open]);
  const open = nav.open;
  const top = open ? navTop(items, open.top) : null;
  return (
    <div ref={rootRef} className={`hvt-scope hvn-root hvn-navroot ${className}`} data-theme={theme} style={style}>
      <nav className={`hvn-v${isCol ? " is-collapsed" : ""}${open && !open.closing ? " is-menu" : ""}`} aria-label="Main navigation">
        <button type="button" className="hvn-toggle" aria-expanded={!isCol} aria-label={isCol ? "Expand navigation" : "Collapse navigation"}
                data-tip={isCol ? "Expand" : "Collapse"} data-tip-side={isCol ? "right" : undefined} onClick={() => { nav.close(true); setCol(!isCol); }}><NavIcon k="toggle" /></button>
        <ul className="hvn-list">
          {items.map((it) => {
            const k = it.key, isActive = active[0] === k, isOpen = open && open.top === k && !open.closing;
            const hidden = isCol || !!open; // the label is hidden: collapsed, or a menu is open
            return (
              <li key={k} className="hvn-li">
                <button type="button" className={`hvn-item${isActive ? " is-active" : ""}${isOpen ? " is-open" : ""}`} data-nav={k}
                        aria-current={isActive ? "page" : undefined} aria-haspopup={it.menu ? "menu" : undefined} aria-expanded={it.menu ? !!isOpen : undefined}
                        aria-label={hidden ? it.label : undefined} data-tip={isCol && !open ? it.label : undefined} data-tip-side="right" onClick={() => nav.pickTop(k, isCol)}>
                  {navIconOf(it)}<span className="hvn-label">{it.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
        {top && top.menu && <NavPanel key={open.id} {...open} top={top} active={active} onSub={nav.onSub} onPick={nav.onPick} onExternal={onExternal} onClosed={nav.closed} />}
      </nav>
      <TipBubble tip={tip} />
    </div>
  );
}
const HD_LOGO = `<path d="M61.4746 28.124C61.473 29.0446 61.6216 29.9589 61.9142 30.8287V30.8323C62.4609 32.4416 63.8382 33.6229 65.4295 34.1419C66.4999 34.4889 67.6153 34.6658 68.7374 34.6667C70.178 34.664 71.6035 34.3638 72.9299 33.7837C73.4952 33.5322 73.9957 33.1479 74.3916 32.6614C74.7875 32.175 75.0678 31.5999 75.2101 30.9819C75.3017 30.586 75.3569 30.182 75.375 29.7753H71.9395C71.9442 30.2447 71.8528 30.7097 71.6712 31.14C71.5368 31.4507 71.3405 31.7287 71.095 31.9558C70.8494 32.1829 70.5602 32.3541 70.2462 32.4581C69.7587 32.6199 69.2495 32.7016 68.7374 32.7003C68.1393 32.6975 67.5467 32.5835 66.9879 32.3638C66.5594 32.1972 66.1749 31.9288 65.8658 31.5802C65.5567 31.2317 65.3315 30.8129 65.2087 30.3578C65.0054 29.6328 64.8995 28.8825 64.8941 28.1279C64.8961 27.2165 65.0479 26.3121 65.3433 25.4532C65.4859 25.0251 65.7198 24.6355 66.0278 24.313C66.3358 23.9905 66.7099 23.7434 67.1227 23.59C68.1036 23.2309 69.1705 23.2071 70.1656 23.5221C70.5119 23.6301 70.8298 23.8186 71.0947 24.0729C71.3596 24.3273 71.5646 24.6408 71.6939 24.9895C71.8043 25.3034 71.8648 25.6336 71.8731 25.9674H75.2952C75.2721 25.6981 75.2331 25.4304 75.1786 25.1659C75.0484 24.5196 74.7689 23.9153 74.364 23.4041C73.9591 22.893 73.4407 22.4902 72.8527 22.2298C70.4032 21.1161 67.6283 21.037 65.123 22.0095C63.9502 22.4626 62.9627 23.3158 62.3246 24.4275C61.7247 25.5586 61.4311 26.8354 61.4746 28.124Z" fill="currentColor"/><path d="M19.2601 26.7262C19.2584 26.7638 19.2601 21.6474 19.2601 21.6474H16C16.0181 21.6474 16 34.3505 16 34.3505H19.2624C19.2615 34.3524 19.262 32.8338 19.2624 31.3792C19.2628 30.0483 19.2631 28.771 19.2624 28.7608C19.2624 28.7608 25.8456 28.7776 25.8456 28.7608V34.3505H29.108C29.1165 34.337 29.108 21.6474 29.108 21.6474H25.8433C25.8415 21.6474 25.8433 26.7446 25.8433 26.7262H19.2601Z" fill="currentColor"/><path d="M49.3541 21.6474V23.8094H44.3681V34.3505H41.1057V23.8094H36.1208C36.1208 23.8094 36.1272 21.6489 36.1208 21.6474H49.3541Z" fill="currentColor"/><path d="M80.305 21.6474V26.7262H86.8928C86.8928 26.7446 86.887 21.6474 86.8928 21.6474H90.1553C90.1553 21.6474 90.1672 34.337 90.1553 34.3505H86.8928V28.7608C86.8928 28.7776 80.305 28.7608 80.305 28.7608C80.3111 28.7821 80.305 34.3541 80.305 34.3505H77.0426C77.0426 34.3505 77.0636 21.6474 77.0426 21.6474H80.305Z" fill="currentColor"/><path d="M58.401 34.3505H62.0316L56.2766 21.6474C56.2766 21.6474 52.2763 21.6558 52.2763 21.6474L46.5236 34.3505C46.5236 34.3505 50.1557 34.3538 50.1531 34.3505C50.172 34.3541 51.2207 31.6194 51.2207 31.6194H57.3319C57.3319 31.6194 58.4065 34.3505 58.401 34.3505ZM52.0069 29.5848L54.2754 23.8094L56.5475 29.5848H52.0069Z" fill-rule="evenodd" clip-rule="evenodd" fill="currentColor"/><path d="M96 21.6474H92.7367V34.3505H96V21.6474Z" fill="currentColor"/><path d="M34.9525 21.6474H31.6935V34.3505H34.9525V21.6474Z" fill="currentColor"/>`;
const HD_HELP = `<path d="M1788 32.6875C1788.35 32.6875 1788.62 32.4077 1788.62 32.0625C1788.62 31.7173 1788.35 31.4375 1788 31.4375C1787.65 31.4375 1787.38 31.7173 1787.38 32.0625C1787.38 32.4077 1787.65 32.6875 1788 32.6875Z" fill="currentColor"/><path d="M1785 26.4375C1785 24.8929 1786.41 23.75 1788 23.75C1789.59 23.75 1791 24.8929 1791 26.4375C1791 27.8179 1789.88 28.8774 1788.5 29.0871V29.25C1788.5 29.5261 1788.28 29.75 1788 29.75C1787.72 29.75 1787.5 29.5261 1787.5 29.25V28.625C1787.5 28.3489 1787.72 28.125 1788 28.125C1789.17 28.125 1790 27.3086 1790 26.4375C1790 25.5664 1789.17 24.75 1788 24.75C1786.83 24.75 1786 25.5664 1786 26.4375V26.75C1786 27.0261 1785.78 27.25 1785.5 27.25C1785.22 27.25 1785 27.0261 1785 26.75V26.4375Z" fill-rule="evenodd" clip-rule="evenodd" fill="currentColor"/><path d="M1788 21C1784.13 21 1781 24.134 1781 28C1781 31.866 1784.13 35 1788 35C1791.87 35 1795 31.866 1795 28C1795 24.134 1791.87 21 1788 21ZM1780 28C1780 23.5817 1783.58 20 1788 20C1792.42 20 1796 23.5817 1796 28C1796 32.4183 1792.42 36 1788 36C1783.58 36 1780 32.4183 1780 28Z" fill-rule="evenodd" clip-rule="evenodd" fill="currentColor"/>`;
const HD_APPS = `<path d="M1830 20.5C1830 20.2239 1830.22 20 1830.5 20H1833.5C1833.78 20 1834 20.2239 1834 20.5V23.5C1834 23.7761 1833.78 24 1833.5 24H1830.5C1830.22 24 1830 23.7761 1830 23.5V20.5Z" fill="currentColor"/><path d="M1836 20.5C1836 20.2239 1836.22 20 1836.5 20H1839.5C1839.78 20 1840 20.2239 1840 20.5V23.5C1840 23.7761 1839.78 24 1839.5 24H1836.5C1836.22 24 1836 23.7761 1836 23.5V20.5Z" fill="currentColor"/><path d="M1842 20.5C1842 20.2239 1842.22 20 1842.5 20H1845.5C1845.78 20 1846 20.2239 1846 20.5V23.5C1846 23.7761 1845.78 24 1845.5 24H1842.5C1842.22 24 1842 23.7761 1842 23.5V20.5Z" fill="currentColor"/><path d="M1842 26.5C1842 26.2239 1842.22 26 1842.5 26H1845.5C1845.78 26 1846 26.2239 1846 26.5V29.5C1846 29.7761 1845.78 30 1845.5 30H1842.5C1842.22 30 1842 29.7761 1842 29.5V26.5Z" fill="currentColor"/><path d="M1836 26.5C1836 26.2239 1836.22 26 1836.5 26H1839.5C1839.78 26 1840 26.2239 1840 26.5V29.5C1840 29.7761 1839.78 30 1839.5 30H1836.5C1836.22 30 1836 29.7761 1836 29.5V26.5Z" fill="currentColor"/><path d="M1830 26.5C1830 26.2239 1830.22 26 1830.5 26H1833.5C1833.78 26 1834 26.2239 1834 26.5V29.5C1834 29.7761 1833.78 30 1833.5 30H1830.5C1830.22 30 1830 29.7761 1830 29.5V26.5Z" fill="currentColor"/><path d="M1830 32.5C1830 32.2239 1830.22 32 1830.5 32H1833.5C1833.78 32 1834 32.2239 1834 32.5V35.5C1834 35.7761 1833.78 36 1833.5 36H1830.5C1830.22 36 1830 35.7761 1830 35.5V32.5Z" fill="currentColor"/><path d="M1836 32.5C1836 32.2239 1836.22 32 1836.5 32H1839.5C1839.78 32 1840 32.2239 1840 32.5V35.5C1840 35.7761 1839.78 36 1839.5 36H1836.5C1836.22 36 1836 35.7761 1836 35.5V32.5Z" fill="currentColor"/><path d="M1842 32.5C1842 32.2239 1842.22 32 1842.5 32H1845.5C1845.78 32 1846 32.2239 1846 32.5V35.5C1846 35.7761 1845.78 36 1845.5 36H1842.5C1842.22 36 1842 35.7761 1842 35.5V32.5Z" fill="currentColor"/>`;
/* AppHeader: 56px; the Hitachi logo, a 24px rule and the app name; at the right help, apps and the account (initials) */
export function AppHeader({ app = "VSP 360", initials = "AC", onHelp, onApps, onAccount, theme = "dawn", className = "", style }) {
  const rootRef = useRef(null);
  const tip = useTips(rootRef, ".hvn-root");
  return (
    <header ref={rootRef} className={`hvt-scope hvn-root hvn-hd ${className}`} data-theme={theme} style={style}>
      <div className="hvn-brand">
        <svg className="hvn-logo" viewBox="16 21 80 14" fill="none" role="img" aria-label="Hitachi" dangerouslySetInnerHTML={{ __html: HD_LOGO }} />
        <span className="hvn-rule" aria-hidden="true" />
        <span className="hvn-app">{app}</span>
      </div>
      <div className="hvn-actions">
        <button type="button" className="hvn-act" aria-label="Help" data-tip="Help" onClick={onHelp}><svg className="hvn-ico" viewBox="1780 20 16 16" fill="none" aria-hidden="true" dangerouslySetInnerHTML={{ __html: HD_HELP }} /></button>
        <button type="button" className="hvn-act" aria-label="Apps" data-tip="Apps" onClick={onApps}><svg className="hvn-ico" viewBox="1830 20 16 16" fill="none" aria-hidden="true" dangerouslySetInnerHTML={{ __html: HD_APPS }} /></button>
        <button type="button" className="hvn-avatar" aria-label="Account" data-tip="Account" onClick={onAccount}>{initials}</button>
      </div>
      <TipBubble tip={tip} />
    </header>
  );
}

import { useEffect } from "react";
import { REDUCED_MOTION, ScrollTrigger } from "./lib/motion";
import Preloader from "./components/Preloader";
import ProgressRail from "./components/ProgressRail";
import Origin from "./scenes/Origin";
import Sense from "./scenes/Sense";
import Redacted from "./scenes/Redacted";
import Civil from "./scenes/Civil";
import Achievements from "./scenes/Achievements";
import Internship from "./scenes/Internship";
import Finale from "./scenes/Finale";

export default function App() {
  useEffect(() => {
    if (REDUCED_MOTION) {
      document.documentElement.classList.add("reduced-motion");
      return;
    }
    // photos load in → pin distances shift; keep triggers honest
    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  return (
    <>
      <Preloader />
      <ProgressRail />
      <main>
        <div data-scene="origin"><Origin /></div>
        <div data-scene="sense"><Sense /></div>
        <div data-scene="redacted"><Redacted /></div>
        <div data-scene="civil"><Civil /></div>
        <div data-scene="achievements"><Achievements /></div>
        <div data-scene="internship"><Internship /></div>
        <div data-scene="finale"><Finale /></div>
      </main>
    </>
  );
}

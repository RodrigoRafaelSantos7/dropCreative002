import { HistoryPill } from "./history";

const Toolbar = () => (
  <div className="fixed bottom-0 z-50 grid w-full grid-cols-3 p-5">
    <HistoryPill />
  </div>
);

export { Toolbar };

import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import animationData from "@/components/ui/loader.json";

const Loader = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface">
      <DotLottieReact
        data={animationData}
        loop
        autoplay
        style={{ width: 160, height: 160 }}
      />
    </div>
  );
};

export default Loader;

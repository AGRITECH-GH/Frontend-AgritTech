const Loader = () => {
  return (
    <div className="min-h-screen bg-surface px-4 py-6 sm:px-6">
      <div className="mx-auto w-full max-w-6xl animate-pulse space-y-6">
        <div className="h-12 w-full rounded-2xl bg-gray-200" />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="h-44 rounded-2xl bg-gray-200" />
          <div className="h-44 rounded-2xl bg-gray-200" />
          <div className="h-44 rounded-2xl bg-gray-200" />
        </div>

        <div className="space-y-3 rounded-2xl bg-white p-5 shadow-sm">
          <div className="h-5 w-40 rounded bg-gray-200" />
          <div className="h-4 w-full rounded bg-gray-200" />
          <div className="h-4 w-11/12 rounded bg-gray-200" />
          <div className="h-4 w-10/12 rounded bg-gray-200" />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="h-56 rounded-2xl bg-gray-200" />
          <div className="h-56 rounded-2xl bg-gray-200" />
        </div>
      </div>
    </div>
  );
};

export default Loader;

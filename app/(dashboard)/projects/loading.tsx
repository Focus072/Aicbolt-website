export default function ProjectsLoading() {
  return (
    <div className="flex min-h-screen w-full">
      {/* Sidebar skeleton */}
      <div className="w-12 lg:w-60 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300">
        <div className="p-4">
          <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-6"></div>
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-8 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="flex-1 bg-gray-50 dark:bg-gray-900 ml-12 lg:ml-60 transition-all duration-300">
        <div className="p-6">
          {/* Header skeleton */}
          <div className="mb-6">
            <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
            <div className="h-4 w-96 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>

          {/* Controls skeleton */}
          <div className="mb-6 flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
            </div>
            <div className="flex gap-2">
              <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
              <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
              <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
            </div>
          </div>

          {/* Stats Cards skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
            ))}
          </div>

          {/* Projects List skeleton */}
          <div className="grid gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-lg p-6 animate-pulse">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-10 w-10 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
                      <div className="flex-1">
                        <div className="h-6 w-48 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
                        <div className="h-4 w-32 bg-gray-300 dark:bg-gray-600 rounded"></div>
                      </div>
                      <div className="h-6 w-20 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                    </div>
                    
                    <div className="h-4 w-full bg-gray-300 dark:bg-gray-600 rounded mb-4"></div>
                    
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      {[...Array(4)].map((_, j) => (
                        <div key={j}>
                          <div className="h-3 w-16 bg-gray-300 dark:bg-gray-600 rounded mb-1"></div>
                          <div className="h-4 w-24 bg-gray-300 dark:bg-gray-600 rounded"></div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="h-2 w-full bg-gray-300 dark:bg-gray-600 rounded mb-4"></div>
                    
                    <div className="flex justify-between">
                      <div className="h-3 w-32 bg-gray-300 dark:bg-gray-600 rounded"></div>
                      <div className="h-3 w-24 bg-gray-300 dark:bg-gray-600 rounded"></div>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-6">
                    <div className="h-8 w-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
                    <div className="h-8 w-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
                    <div className="h-8 w-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

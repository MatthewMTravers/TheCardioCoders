import { React } from 'react';
import { Youtube } from 'lucide-react';

// VideoLinks component to display exercise video recommendations
const VideoLinks = ({ videoLinks }) => {
  if (!videoLinks || videoLinks.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
      <h3 className="text-md font-bold mb-2">Exercise Demonstrations</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {videoLinks.map((link, index) => (
          <div key={index} className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
            <h4 className="font-semibold text-sm capitalize">{link.exercise}</h4>
            <p className="text-xs text-gray-600 mb-1">
              Difficulty: <span className="capitalize">{link.difficulty}</span>
            </p>
            <div className="flex space-x-2 mt-2">
              <a
                href={link.video_url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-red-600 text-white px-2 py-1 rounded text-xs text-center hover:bg-red-700 transition-colors flex-1 flex items-center justify-center"
              >
                <Youtube className="w-3 h-3 mr-1" />
                Full Video
              </a>
              <a
                href={link.short_url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-700 text-white px-2 py-1 rounded text-xs text-center hover:bg-gray-800 transition-colors flex-1 flex items-center justify-center"
              >
                <Youtube className="w-3 h-3 mr-1" />
                Short
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoLinks;
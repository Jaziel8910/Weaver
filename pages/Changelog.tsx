import React from 'react';
import { changelogData } from '../constants';
import { GitCommit } from 'lucide-react';

const Changelog: React.FC = () => {
  return (
    <div className="p-8 h-full max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-white">Changelog</h1>
        <p className="text-gray-400 mt-2">Tracking the evolution of the Weaver platform.</p>
      </header>
      
      <div className="space-y-12">
        {changelogData.map((item, index) => (
          <div key={index} className="relative pl-8">
            <div className="absolute left-0 top-1.5 h-full border-l-2 border-gray-700"></div>
            <div className="absolute left-[-9px] top-0 bg-primary-500 p-1.5 rounded-full">
                <GitCommit size={16} className="text-white"/>
            </div>
            <p className="text-sm text-gray-500 mb-1">{item.date}</p>
            <h2 className="text-2xl font-bold text-primary-500">{item.version}</h2>
            <ul className="mt-4 space-y-2 list-disc list-inside text-gray-300">
                {item.changes.map((change, i) => (
                    <li key={i}>{change}</li>
                ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Changelog;
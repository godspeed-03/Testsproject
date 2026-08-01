import React from 'react';
import { TrackerProvider } from './TrackerContext';
import TrackerLayoutClient from './TrackerLayoutClient';

export default function TrackerLayout({ children }: { children: React.ReactNode }) {
  return (
    <TrackerProvider>
      <TrackerLayoutClient>{children}</TrackerLayoutClient>
    </TrackerProvider>
  );
}

declare global {
  interface Window {
    initMap?: () => void; // Declare initMap as an optional function
  }
}

export default global;

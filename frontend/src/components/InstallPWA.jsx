import React, { useEffect, useState } from "react";
import { message } from "antd";

function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      // Show the install button
      setShowInstallButton(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Check if app is already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setShowInstallButton(false);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      message.success("App installed successfully!");
    }

    // Clear the deferredPrompt for later use
    setDeferredPrompt(null);
    setShowInstallButton(false);
  };

  const handleDismiss = () => {
    setShowInstallButton(false);
    // Store dismissal in localStorage to not show again for 7 days
    localStorage.setItem(
      "pwa-install-dismissed",
      Date.now() + 7 * 24 * 60 * 60 * 1000
    );
  };

  useEffect(() => {
    const dismissed = localStorage.getItem("pwa-install-dismissed");
    if (dismissed && Date.now() < parseInt(dismissed)) {
      setShowInstallButton(false);
    }
  }, []);

  if (!showInstallButton) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 z-50 border border-gray-200 dark:border-gray-700">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center">
          <img
            src="/logo192.png"
            alt="Quiz App"
            className="w-12 h-12 mr-3 rounded-lg"
          />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Install Quiz App
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Add to your home screen for quick access
            </p>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          aria-label="Dismiss"
        >
          <i className="ri-close-line text-xl"></i>
        </button>
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleInstallClick}
          className="flex-1 primary-contained-btn dark:bg-black dark:border-black dark:hover:text-black dark:hover:border-black transition-all duration-200 ease-linear rounded-md"
        >
          <i className="ri-download-line mr-1"></i>
          Install
        </button>
        <button
          onClick={handleDismiss}
          className="flex-1 primary-outlined-btn dark:hover:bg-black dark:text-black dark:border-black transition-all duration-200 ease-linear"
        >
          Not Now
        </button>
      </div>
    </div>
  );
}

export default InstallPWA;

import { WrenchScrewdriverIcon } from "@heroicons/react/24/outline";

const ContactUs = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
      <WrenchScrewdriverIcon className="w-20 h-20 text-yellow-500 mb-6 animate-bounce" />
      <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100 mb-4 text-center">
        Contact Us
      </h1>
      <p className="text-center text-gray-500 dark:text-gray-400 text-lg md:text-xl max-w-md">
        🚧 This page is currently under construction. We're working hard to
        bring you a better experience!
      </p>
    </div>
  );
};

export default ContactUs;

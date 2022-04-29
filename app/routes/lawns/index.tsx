import { PlusIcon } from "@heroicons/react/solid";
import { Link } from "@remix-run/react";
import logo from "~/images/logo.png";

export default function LawnIndexPage() {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 sm:mx-auto sm:max-w-xl sm:py-0 sm:px-6 md:px-8">
      <img src={logo} alt="logo" className="w-32 " />
      <p className="mt-9">No lawn selected. Select a lawn on the left, or </p>
      <div className="my-9 flex justify-center">
        <Link
          to="new"
          className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          Create a new Lawn
        </Link>
      </div>
    </div>
  );
}

import { Link } from "@remix-run/react";

import { useOptionalUser } from "~/utils";
import logoIcon from "~/images/logo.png";

export default function Index() {
  const user = useOptionalUser();
  return (
    <div className="-my-4 -mx-4 bg-white sm:py-24">
      <div className="relative sm:py-16">
        <div aria-hidden="true" className="hidden sm:block">
          <div className="absolute inset-y-0 left-0 w-1/2 rounded-r-3xl bg-blue-100" />
          <svg
            className="absolute top-8 left-1/2 -ml-3"
            width={404}
            height={392}
            fill="none"
            viewBox="0 0 404 392"
          >
            <defs>
              <pattern
                id="8228f071-bcee-4ec8-905a-2a059a2cc4fb"
                x={0}
                y={0}
                width={20}
                height={20}
                patternUnits="userSpaceOnUse"
              >
                <rect
                  x={0}
                  y={0}
                  width={4}
                  height={4}
                  className="text-blue-200"
                  fill="currentColor"
                />
              </pattern>
            </defs>
            <rect
              width={404}
              height={392}
              fill="url(#8228f071-bcee-4ec8-905a-2a059a2cc4fb)"
            />
          </svg>
        </div>
        <div className="mx-auto max-w-md px-4 sm:max-w-3xl sm:px-6 lg:max-w-7xl lg:px-8">
          <div className="relative overflow-hidden rounded-2xl bg-blue-600 px-6 py-10 shadow-xl sm:px-12 sm:py-20">
            <div
              aria-hidden="true"
              className="absolute inset-0 -mt-72 sm:-mt-32 md:mt-0"
            >
              <svg
                className="absolute inset-0 h-full w-full"
                preserveAspectRatio="xMidYMid slice"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 1463 360"
              >
                <path
                  className="text-blue-500 text-opacity-40"
                  fill="currentColor"
                  d="M-82.673 72l1761.849 472.086-134.327 501.315-1761.85-472.086z"
                />
                <path
                  className="text-blue-700 text-opacity-40"
                  fill="currentColor"
                  d="M-217.088 544.086L1544.761 72l134.327 501.316-1761.849 472.086z"
                />
              </svg>
            </div>
            <div className="relative">
              <div className="sm:text-center">
                <div className="flex justify-center">
                  <img
                    src={logoIcon}
                    alt="Logo"
                    className="h-48 w-auto sm:h-52"
                  />
                </div>
                <h2 className="mt-8 text-6xl font-extrabold tracking-tight text-white sm:text-8xl">
                  Welcome To CSF
                </h2>
                <p className="mx-auto mt-6 max-w-2xl text-2xl text-blue-200">
                  The water deficit tool for your lawn.
                </p>
              </div>
              <div className="mt-12 flex justify-center space-x-6 sm:mx-auto sm:flex sm:max-w-lg">
                {user ? (
                  <Link
                    to="/lawns"
                    className="block rounded-md border border-transparent bg-blue-500 px-5 py-3 text-base font-medium text-white shadow hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600 sm:px-10"
                  >
                    View Lawns for {user.email}
                  </Link>
                ) : (
                  <>
                    <div className="inline-flex rounded-md shadow">
                      <Link
                        to="/join"
                        className="block w-full rounded-md border border-transparent bg-blue-500 px-5 py-3 text-base font-medium text-white shadow hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600 sm:px-10"
                      >
                        Sign up
                      </Link>
                    </div>
                    <div className="ml-3 inline-flex">
                      <Link
                        to="/login"
                        className="block w-full rounded-md border border-transparent bg-blue-500 px-5 py-3 text-base font-medium text-white shadow hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600 sm:px-10"
                      >
                        Log in
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

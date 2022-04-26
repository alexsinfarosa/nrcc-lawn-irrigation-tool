import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  LogoutIcon,
  MenuIcon,
  PlusIcon,
  XIcon,
} from "@heroicons/react/outline";

import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, NavLink, Outlet, useLoaderData } from "@remix-run/react";

import { requireUserId } from "~/session.server";
import { getLawnListItems } from "~/models/lawn.server";
import nyWaterLogo from "../images/ny-water-logo.svg";

type LoaderData = {
  lawnListItems: Awaited<ReturnType<typeof getLawnListItems>>;
};

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const lawnListItems = await getLawnListItems({ userId });
  return json<LoaderData>({ lawnListItems });
};

export default function Example() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const data = useLoaderData() as LoaderData;

  return (
    <>
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-40 flex md:hidden"
          onClose={setSidebarOpen}
        >
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-gray-600 bg-opacity-75" />
          </Transition.Child>
          <Transition.Child
            as={Fragment}
            enter="transition ease-in-out duration-300 transform"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white">
              <Transition.Child
                as={Fragment}
                enter="ease-in-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in-out duration-300"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="absolute top-0 right-0 -mr-12 pt-2">
                  <button
                    type="button"
                    className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span className="sr-only">Close sidebar</span>
                    <XIcon className="h-6 w-6 text-white" aria-hidden="true" />
                  </button>
                </div>
              </Transition.Child>
              <div className="h-0 flex-1 overflow-y-auto pt-5 pb-4">
                <div className="flex flex-shrink-0 items-center justify-center px-4">
                  <Link to=".">
                    <img
                      className="h-20 w-auto"
                      src={nyWaterLogo}
                      alt="NY American Water"
                    />
                  </Link>
                </div>
                <div className="my-9 flex justify-center">
                  <Link
                    to="new"
                    onClick={() => setSidebarOpen(false)}
                    className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    <PlusIcon
                      className="-ml-1 mr-2 h-5 w-5"
                      aria-hidden="true"
                    />
                    New Lawn
                  </Link>
                </div>

                <div className="relative mx-4">
                  <div
                    className="absolute inset-0 flex items-center"
                    aria-hidden="true"
                  >
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white px-2 text-sm text-gray-500">
                      Lawns
                    </span>
                  </div>
                </div>

                <nav className="mt-1 flex-1 space-y-1 bg-white px-2">
                  {data.lawnListItems.length === 0 ? (
                    <p className="p-4">No lawns yet</p>
                  ) : (
                    <>
                      {data.lawnListItems.map((lawn) => (
                        <NavLink
                          key={lawn.id}
                          prefetch="intent"
                          className={({ isActive }) =>
                            `group flex items-center rounded-md px-2 py-2 text-sm font-medium ${
                              isActive
                                ? "bg-gray-100 text-gray-900"
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            }`
                          }
                          onClick={() => setSidebarOpen(false)}
                          to={lawn.id}
                        >
                          {lawn.name}
                        </NavLink>
                      ))}
                    </>
                  )}
                </nav>
              </div>
              <div className="flex flex-shrink-0 justify-center border-t border-gray-200 p-4">
                <Form action="/logout" method="post">
                  <button
                    type="submit"
                    className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-100"
                  >
                    <LogoutIcon
                      className="-ml-1 mr-2 h-5 w-5"
                      aria-hidden="true"
                    />
                    Logout
                  </button>
                </Form>
              </div>
            </div>
          </Transition.Child>
          <div className="w-14 flex-shrink-0">
            {/* Force sidebar to shrink to fit close icon */}
          </div>
        </Dialog>
      </Transition.Root>

      {/* Static sidebar for desktop */}
      <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
        {/* Sidebar component, swap this element with another sidebar if you like */}
        <div className="flex min-h-0 flex-1 flex-col border-r border-gray-200 bg-white">
          <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
            <div className="flex flex-shrink-0 items-center justify-center px-4">
              <Link to=".">
                <img
                  className="h-20 w-auto"
                  src={nyWaterLogo}
                  alt="NY American Water"
                />
              </Link>
            </div>
            <div className="my-9 flex justify-center">
              <Link
                to="new"
                className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                + New Lawn
              </Link>
            </div>

            <div className="relative mx-4">
              <div
                className="absolute inset-0 flex items-center"
                aria-hidden="true"
              >
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-2 text-sm text-gray-500">
                  Lawns
                </span>
              </div>
            </div>
            <nav className="mt-1 flex-1 space-y-1 bg-white px-2">
              {data.lawnListItems.length === 0 ? (
                <p className="p-4">No lawns yet</p>
              ) : (
                <>
                  {data.lawnListItems.map((lawn) => (
                    <NavLink
                      key={lawn.id}
                      className={({ isActive }) =>
                        `group flex items-center rounded-md px-2 py-2 text-sm font-medium ${
                          isActive
                            ? "bg-gray-100 text-gray-900"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`
                      }
                      to={lawn.id}
                    >
                      {lawn.name}
                    </NavLink>
                  ))}
                </>
              )}
            </nav>
          </div>
          <div className="flex flex-shrink-0 flex-col p-4">
            <Form
              action="/logout"
              method="post"
              className="flex justify-center"
            >
              <button
                type="submit"
                className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-100"
              >
                <LogoutIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                Logout
              </button>
            </Form>
          </div>
        </div>
      </div>
      <div className="flex flex-1 flex-col md:pl-64">
        <div className="sticky top-0 z-10 bg-gray-100 pl-1 pt-1 sm:pl-3 sm:pt-3 md:hidden">
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 inline-flex h-12 w-12 items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <MenuIcon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <main className="flex-1">
          <div className="sm:py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
              {/* Replace with your content */}
              <div className="sm:py-4">
                <Outlet />
              </div>
              {/* /End replace */}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

import { Menu, Transition } from "@headlessui/react";
import {
  CalendarIcon,
  ChevronDownIcon,
  LocationMarkerIcon,
  LogoutIcon,
  PlusIcon,
  StarIcon,
  TrashIcon,
} from "@heroicons/react/solid";
import type { Lawn } from "@prisma/client";
import { Form, Link } from "@remix-run/react";
import clsx from "clsx";
import { Fragment } from "react";

export default function Header({ lawn, email }: { lawn: Lawn; email: string }) {
  return (
    <div className="sm:border-b sm:border-gray-200 sm:pb-5">
      <div className="sm:flex sm:items-baseline sm:justify-between">
        <div className="hidden sm:block sm:w-0 sm:flex-1">
          <h1
            id="lawn-name"
            className="max-w-xs text-2xl font-semibold text-gray-900 sm:text-3xl"
          >
            {lawn.name}
          </h1>
          <div className="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6">
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <LocationMarkerIcon
                className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                aria-hidden="true"
              />
              {lawn.address}
            </div>
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <StarIcon
                className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                aria-hidden="true"
              />
              {lawn.sprName}
            </div>
            {lawn.waterOrdinance && (
              <div className="mt-2 flex items-center text-sm text-gray-500">
                <CalendarIcon
                  className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                  aria-hidden="true"
                />
                {lawn.waterOrdinance}
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 hidden items-center justify-end sm:mt-0 sm:ml-6 sm:flex sm:flex-shrink-0 sm:justify-start">
          <Menu as="div" className="relative z-10 inline-block text-left">
            <div>
              <Menu.Button className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-100">
                Menu
                <ChevronDownIcon
                  className="-mr-1 ml-2 h-5 w-5"
                  aria-hidden="true"
                />
              </Menu.Button>
            </div>

            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="px-4 py-3">
                  <p className="text-sm">Signed in as</p>
                  <p className="truncate text-sm font-medium text-gray-900">
                    {email}
                  </p>
                </div>
                <div className="py-1">
                  <Form method="post">
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          to="/lawns/new"
                          className={clsx(
                            active
                              ? "bg-gray-100 text-gray-900"
                              : "text-gray-700",
                            "group flex w-full items-center px-4 py-2 text-sm"
                          )}
                        >
                          <PlusIcon
                            className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                            aria-hidden="true"
                          />
                          New Lawn
                        </Link>
                      )}
                    </Menu.Item>
                  </Form>
                </div>
                <div className="py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <Form method="post">
                        <button
                          type="submit"
                          name="_action"
                          value="delete"
                          className={clsx(
                            active
                              ? "bg-gray-100 text-gray-900"
                              : "text-gray-700",
                            "group flex w-full items-center px-4 py-2 text-sm"
                          )}
                        >
                          <TrashIcon
                            className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                            aria-hidden="true"
                          />
                          Delete Lawn
                        </button>
                      </Form>
                    )}
                  </Menu.Item>
                </div>
                <div className="py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <Form action="/logout" method="post">
                        <button
                          type="submit"
                          className={clsx(
                            active
                              ? "bg-gray-100 text-gray-900"
                              : "text-gray-700",
                            "group flex w-full items-center px-4 py-2 text-sm"
                          )}
                        >
                          <LogoutIcon
                            className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                            aria-hidden="true"
                          />
                          Log out
                        </button>
                      </Form>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>
    </div>
  );
}

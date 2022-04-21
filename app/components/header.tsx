import { Menu, Transition } from "@headlessui/react";
import {
  CalendarIcon,
  DotsVerticalIcon,
  LocationMarkerIcon,
  StarIcon,
} from "@heroicons/react/solid";
import type { Lawn } from "@prisma/client";
import { Form } from "@remix-run/react";
import clsx from "clsx";
import { Fragment } from "react";

export default function Header({ lawn }: { lawn: Lawn }) {
  return (
    <div className="border-b border-gray-200 pb-5">
      <div className="sm:flex sm:items-baseline sm:justify-between">
        <div className="sm:w-0 sm:flex-1">
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

        <div className="mt-4 flex items-center justify-end sm:mt-0 sm:ml-6 sm:flex-shrink-0 sm:justify-start">
          <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-0.5 text-sm font-medium text-gray-800">
            Menu
          </span>
          <Menu as="div" className="relative ml-1 inline-block text-left">
            <div>
              <Menu.Button className="-my-2 flex items-center rounded-full bg-white p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <span className="sr-only">Open options</span>
                <DotsVerticalIcon className="h-7 w-7" aria-hidden="true" />
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
              <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
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
                            "flex w-full justify-between px-4 py-2 text-sm"
                          )}
                        >
                          <span>Delete Lawn</span>
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

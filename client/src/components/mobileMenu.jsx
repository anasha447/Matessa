import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { FaUserCircle, FaTimes } from 'react-icons/fa';
import { Link, NavLink } from 'react-router-dom';

const MobileMenu = ({
  isOpen,
  onClose,
  navLinks = [],
  userInfo = null,
  handleLogout = () => {},
  getGravatarURL = () => '',
}) => {
  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-500"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-500"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 left-0 flex max-w-full">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="-translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="-translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col overflow-y-scroll bg-[#2F3B28] shadow-xl">
                    <div className="flex items-center justify-between p-4 border-b border-[#EADBA2]/30">
                      <Dialog.Title className="text-lg font-medium text-[#EADBA2]">
                        Menu
                      </Dialog.Title>
                      <button
                        type="button"
                        className="rounded-md text-[#EADBA2] hover:text-white"
                        onClick={onClose}
                      >
                        <span className="sr-only">Close panel</span>
                        <FaTimes size={24} aria-hidden="true" />
                      </button>
                    </div>
                    <div className="relative mt-6 flex-1 px-4 sm:px-6">
                      {/* Nav links */}
                      <nav className="flex-1 overflow-y-auto">
                        {navLinks.map((item) => (
                          <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={onClose}
                            className={({ isActive }) =>
                              `block px-6 py-4 font-bold font-body text-lg border-b border-[#EADBA2]/20 text-[#EADBA2] hover:text-[#E85D1F] hover:bg-[#3A4A33] transition ${
                                isActive ? 'text-[#E85D1F]' : ''
                              }`
                            }
                          >
                            {item.name}
                          </NavLink>
                        ))}
                      </nav>
                    </div>
                    {/* Bottom Login/Profile */}
                    <div className="border-t border-[#EADBA2]/30 p-4 flex items-center gap-3 text-[#EADBA2]">
                      {userInfo ? (
                        <>
                          <img
                            src={getGravatarURL(userInfo.email)}
                            alt={userInfo.name}
                            className="w-10 h-10 rounded-full border-2 border-[#EADBA2]"
                          />
                          <div className="flex flex-col">
                            <Link
                              to={userInfo.isAdmin ? '/admin/dashboard' : '/profile'}
                              onClick={onClose}
                              className="hover:text-[#E85D1F] font-bold font-body"
                            >
                              {userInfo.isAdmin ? 'Admin' : userInfo.name}
                            </Link>
                            <button
                              onClick={() => {
                                handleLogout();
                                onClose();
                              }}
                              className="text-sm hover:text-[#E85D1F]"
                            >
                              Logout
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="w-full flex flex-col items-center gap-4">
                          <div className="flex items-center gap-3">
                            <FaUserCircle size={28} />
                            <Link
                              to="/login"
                              onClick={onClose}
                              className="hover:text-[#E85D1F] font-bold text-lg font-body"
                            >
                              Sign In
                            </Link>
                          </div>
                          <Link
                            to="/register"
                            onClick={onClose}
                            className="bg-[#E85D1F] text-white font-bold py-2 px-6 rounded-full hover:opacity-90 transition-opacity w-full text-center"
                          >
                            Sign Up
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default MobileMenu;

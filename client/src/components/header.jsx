import React, { useState, useEffect, useRef } from "react";
import { MdShoppingCart } from "react-icons/md";
import { FaUserCircle, FaBars, FaTimes } from "react-icons/fa";
import { Link, NavLink, useNavigate } from "react-router-dom";
import md5 from "md5";
import logo from "../assets/logob.png";
import MobileMenu from "./mobileMenu";
import CartDrawer from "./CartDrawer";

// ✅ Redux Imports
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../redux/slices/authSlice";
import { clearCart } from "../redux/slices/cartSlice";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const userMenuTimeout = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // ✅ 1. Read Data from Redux Store
  const { user } = useSelector((state) => state.auth);
  const { items } = useSelector((state) => state.cart);

  // ✅ 2. Calculate Item Count Dynamically
  const itemCount = items ? items.reduce((total, item) => total + item.quantity, 0) : 0;

  // ✅ 3. Determine Admin Status
  const isAdmin = user?.roles?.includes("ROLE_ADMIN");

  // ✅ 4. Handle Logout
  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      dispatch(clearCart());
      navigate("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  // Helper for Gravatar
  const getGravatarURL = (email) => {
    if (!email) return "";
    const hash = md5(email.trim().toLowerCase());
    return `https://www.gravatar.com/avatar/${hash}?d=mp`;
  };

  // Hover Handlers
  const handleUserMenuEnter = () => {
    clearTimeout(userMenuTimeout.current);
    setIsUserMenuOpen(true);
  };

  const handleUserMenuLeave = () => {
    userMenuTimeout.current = setTimeout(() => {
      setIsUserMenuOpen(false);
    }, 1000);
  };

  // Scroll Effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 8);
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(userMenuTimeout.current);
    };
  }, []);

  const navLinks = [
    { name: "Shop", path: "/shop" },
    { name: "What is mate?!", path: "/what.is.mate" },
    { name: "Our Story", path: "/our_story" },
    { name: "Contact Us", path: "/contact-us" },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-all duration-300 backdrop-blur-md ${
          isScrolled ? "bg-[#2F3B28]/50 shadow-md" : "bg-[#2F3B28]"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 lg:h-20  relative">
            
            {/* Left: Nav & Mobile Toggle */}
            <div className="flex items-center">
              
              {/* CHANGE 1 & 2: 
                 - Hide Desktop Nav if isAdmin is true.
                 - Changed breakpoint from 'md:block' to 'lg:block' for iPad support.
              */}
              {!isAdmin && (
                <nav className="hidden lg:block">
                  <ul className="flex gap-8 font-body font-bold text-base lg:text-lg">
                    {navLinks.map((item) => (
                      <li key={item.path}>
                        <NavLink
                          to={item.path}
                          className={({ isActive }) =>
                            `text-[#EADBA2] hover:text-[#E85D1F] transition-colors ${
                              isActive ? "text-[#E85D1F]" : ""
                            }`
                          }
                        >
                          {item.name}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </nav>
              )}

              {/* CHANGE 3: 
                 - If isAdmin: Button is always 'block' (visible).
                 - If User: Button is 'lg:hidden' (Visible on Mobile/iPad, Hidden on Desktop).
              */}
              <button
                className={`text-[#EADBA2] ${isAdmin ? "block" : "lg:hidden"}`}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
              </button>
            </div>

            {/* Center Logo */}
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <Link to="/" aria-label="Matessa home">
                <img
                  src={logo}
                  alt="Matessa Logo"
                  className="h-10 md:h-15 lg:h-15 object-contain transition-transform duration-500 hover:scale-105"
                />
              </Link>
            </div>

            {/* Right: Cart + User */}
            <div className="flex items-center gap-4">
              
              {isAdmin ? (
                <div
                  className="relative"
                  onMouseEnter={handleUserMenuEnter}
                  onMouseLeave={handleUserMenuLeave}
                >
                  <button className="font-bold text-[#EADBA2] hover:text-[#E85D1F] transition-colors">
                    Admin
                  </button>
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-[#2F3B28] rounded-md shadow-lg py-1 z-50 border border-white/10">
                      <Link to="/admin/dashboard" className="block px-4 py-2 text-sm text-[#EADBA2] hover:bg-[#4A5C40]">Dashboard</Link>
                      <Link to="/admin/products" className="block px-4 py-2 text-sm text-[#EADBA2] hover:bg-[#4A5C40]">Products</Link>
                      <Link to="/admin/orders" className="block px-4 py-2 text-sm text-[#EADBA2] hover:bg-[#4A5C40]">Orders</Link>
                      <Link to="/admin/AdminInbox" className="block px-4 py-2 text-sm text-[#EADBA2] hover:bg-[#4A5C40]">Inbox</Link>
                      <Link to="/admin/users" className="block px-4 py-2 text-sm text-[#EADBA2] hover:bg-[#4A5C40]">Users</Link>
                      <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-[#EADBA2] hover:bg-[#4A5C40]">Logout</button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {/* Cart Icon */}
                  <button
                    onClick={() => setIsDrawerOpen(true)}
                    aria-label="Open Cart"
                    className="relative focus:outline-none"
                  >
                    <MdShoppingCart
                      size={26}
                      className="text-[#EADBA2] hover:text-[#E85D1F] transition-colors duration-300"
                    />
                    {itemCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-[#E85D1F] text-white text-xs font-bold px-1.5 py-0.5 rounded-full shadow-md">
                        {itemCount}
                      </span>
                    )}
                  </button>

                  {/* User Dropdown - CHANGE 4: Updated breakpoint to lg:block for iPad */}
                  <div
                    className="relative hidden lg:block"
                    onMouseEnter={handleUserMenuEnter}
                    onMouseLeave={handleUserMenuLeave}
                  >
                    <button className="text-[#EADBA2] hover:text-[#E85D1F] transition-colors">
                      {user ? (
                        <img
                          src={getGravatarURL(user.email || user.username)}
                          alt={user.username}
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <FaUserCircle size={26} />
                      )}
                    </button>
                    
                    {isUserMenuOpen && (
                      user ? (
                        <div className="absolute right-0 mt-2 w-48 bg-[#2F3B28] rounded-md shadow-lg py-1 z-50 border border-white/10">
                          <Link to="/profile" className="block px-4 py-2 text-sm text-[#EADBA2] hover:bg-[#4A5C40]">
                            Welcome, {user.username}
                          </Link>
                          <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-[#EADBA2] hover:bg-[#4A5C40]">
                            Logout
                          </button>
                        </div>
                      ) : (
                        <div className="absolute right-0 mt-2 w-48 bg-[#2F3B28] rounded-md shadow-lg py-1 z-50 border border-white/10">
                          <Link to="/login" className="block px-4 py-2 text-sm text-[#EADBA2] hover:bg-[#4A5C40]">Sign In</Link>
                          <Link to="/register" className="block px-4 py-2 text-sm text-[#EADBA2] hover:bg-[#4A5C40]">Sign Up</Link>
                        </div>
                      )
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* CHANGE 5: Pass isAdmin prop to MobileMenu so it can show admin links */}
        <MobileMenu
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          navLinks={navLinks}
          userInfo={user}
          isAdmin={isAdmin} 
          handleLogout={handleLogout}
          getGravatarURL={getGravatarURL}
        />
      </header>

      <CartDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
      />
    </>
  );
};

export default Header;
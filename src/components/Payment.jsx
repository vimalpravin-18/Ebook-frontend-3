import { useMemo, useRef, useState, useEffect } from "react";

// Environment variables - support both Vite and CRA
const RAZORPAY_KEY_ID = 
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_RAZORPAY_KEY_ID) ;

const API_BASE = 
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE);

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

function useReveal(threshold = 0.12) {
  const [inView, setInView] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.unobserve(entry.target);
        }
      },
      { threshold }
    );
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, [threshold]);
  return { ref, inView };
}

function useTilt(maxTilt = 12, glare = true) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const glareEl = glare ? el.querySelector(".glare-effect") : null;
    function onMove(e) {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const rotateX = (y - 0.5) * -maxTilt * 2;
      const rotateY = (x - 0.5) * maxTilt * 2;
      el.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
      if (glareEl) {
        glareEl.style.background = `radial-gradient(circle at ${x * 100}% ${y * 100}%, rgba(255,255,255,0.2), transparent 60%)`;
        glareEl.style.opacity = "1";
      }
    }
    function onLeave() {
      el.style.transform = "perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
      if (glareEl) glareEl.style.opacity = "0";
    }
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [maxTilt, glare]);
  return ref;
}

function useFavorites(key = "fav_books") {
  const [favs, setFavs] = useState(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem(key) || "[]"));
    } catch {
      return new Set();
    }
  });
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify([...favs]));
  }, [favs, key]);
  const toggle = (id) =>
    setFavs((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  const has = (id) => favs.has(id);
  return { favs, has, toggle };
}

function FloatingParticles() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.4 + 0.1,
    }));
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
        ctx.fill();
      });
      requestAnimationFrame(animate);
    }
    animate();
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none opacity-30"
    />
  );
}

function ScrollProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    function updateProgress() {
      const scrollHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = scrollHeight > 0 ? (window.scrollY / scrollHeight) * 100 : 0;
      setProgress(scrolled);
    }
    window.addEventListener("scroll", updateProgress);
    updateProgress(); // Initial call
    return () => window.removeEventListener("scroll", updateProgress);
  }, []);
  return (
    <div className="fixed top-0 left-0 right-0 h-1 bg-white/5 z-50">
      <div
        className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 transition-all duration-150"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

export default function Payment({ user }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [debounced, setDebounced] = useState("");
  const [preview, setPreview] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [downloadToken, setDownloadToken] = useState(null);
  const [showDownload, setShowDownload] = useState(false);
  const [downloadBook, setDownloadBook] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Debug log for environment variables
  useEffect(() => {
    console.log('Environment Check:', {
      API_BASE,
      RAZORPAY_KEY_ID,
      hasAPI: !!API_BASE,
      hasRazorpay: !!RAZORPAY_KEY_ID
    });
  }, []);

  // Debug log for modal state
  useEffect(() => {
    console.log('Modal State:', { downloadToken, showDownload, downloadBook: downloadBook?.title });
  }, [downloadToken, showDownload, downloadBook]);

  useEffect(() => {
    const handleMouse = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handleMouse);
    return () => window.removeEventListener("mousemove", handleMouse);
  }, []);

  // Debounce search term - FIXED
  useEffect(() => {
    const id = setTimeout(() => {
      setDebounced(searchTerm.trim().toLowerCase());
    }, 300);
    return () => clearTimeout(id);
  }, [searchTerm]);

  const { has: isFav, toggle: toggleFav } = useFavorites();

  useEffect(() => {
    if (preview || showDownload) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [preview, showDownload]);

  const books = useMemo(
    () => [
      {
        id: "disc1",
        title: "Psychology of Discipline",
        cover: "/covers/generated-image (1).png",
        desc: "Master your mindset and build lasting habits with practical frameworks, habit loops, and friction design.",
        price: 900,
        isFree: false,
        grad: "from-purple-600 to-pink-600",
        ring: "ring-purple-400/30",
        productId: "68e22d1c3afc3781bb387824",
        sampleUrl: "/samples/psychology of discipline prev.pdf",
      },
      {
        id: "life1",
        title: "The Life You're Meant To Live",
        cover: "covers/The Life You’re Meant to Live book cover.jpg",
        desc: "Discover purpose with guided prompts, values mapping, and a 12-week clarity plan.",
        price: 16900,
        isFree: false,
        grad: "from-pink-600 to-rose-600",
        ring: "ring-pink-400/30",
        sampleUrl: "/samples/life you`re meant live prev.pdf",
        productId: "68e22d1c3afc3781bb387825",
      },
      {
        id: "focus1",
        title: "Psychology of Focus",
        cover: "/covers/generated-image (2).png",
        desc: "Eliminate distractions and achieve deep work with attention-guarding tactics and sprint protocols.",
        price: 15900,
        isFree: false,
        grad: "from-blue-600 to-cyan-600",
        ring: "ring-cyan-400/30",
        sampleUrl: "/samples/psychology of focus prev.pdf",
        productId: "68e22d1c3afc3781bb387826",
      },
      {
        id: "side1",
        title: "The Side Hustle Millionaire",
        cover: "/covers/side hustle cover image.jpg",
        desc: "Build scalable side projects with offer design, distribution playbooks, and compounding skills.",
        price: 18900,
        isFree: false,
        grad: "from-orange-600 to-amber-600",
        ring: "ring-amber-400/30",
        sampleUrl: "/samples/side hustle prev.pdf",
        productId: "68e22d1c3afc3781bb387827",
      },
      {
        id: "min1",
        title: "Master Your Minutes",
        cover: "/covers/Master Your Minutes.jpg",
        desc: "Optimize your time with calendar guardrails, batching, and task runway planning.",
        price: 19900,
        isFree: false,
        grad: "from-violet-600 to-indigo-600",
        ring: "ring-indigo-400/30",
        sampleUrl: "/samples/master your minutes prev.pdf",
        productId: "68e22d1c3afc3781bb387828",
      },
      {
        id: "habit1",
        title: "Psychology of Habits",
        cover: "covers/Psychology of habits cov.jpg",
        desc: "Build lasting habits with science-backed strategies and behavioral design principles.",
        price: 12900,
        isFree: false,
        grad: "from-emerald-600 to-teal-600",
        ring: "ring-emerald-400/30",
        sampleUrl: "/samples/psychology of habits prev.pdf",
        productId: "68e22d1c3afc3781bb387829",
      },
      {
        id: "letter1",
        title: "The Last Letter I Never Sent",
        cover: "covers/The letter i Never sent img.png",
        desc: "A heartfelt journey through emotions, memories, and words left unsaid.",
        price: 14900,
        isFree: false,
        grad: "from-red-600 to-pink-600",
        ring: "ring-red-400/30",
        sampleUrl: "/samples/the letter i never sent.pdf",
        productId: "68e22d1c3afc3781bb38782a",
      },
      {
        id: "ikigai1",
        title: "Unlocking My Ikigai",
        cover: "covers/Unlocking My Ikigai Book Cover.png",
        desc: "Discover your reason for being through Japanese philosophy and self-reflection exercises.",
        price: 11900,
        isFree: false,
        grad: "from-yellow-600 to-orange-600",
        ring: "ring-yellow-400/30",
        sampleUrl: "/samples/Unlocking of ikigai prev.pdf",
        productId: "68e22d1c3afc3781bb38782b",
      },
      {
        id: "Confi1",
        title: "Psychology Of Confidence",
        cover: "covers/psychology of confidence image.jpg",
        desc: "Discover your reason for being through Japanese philosophy and self-reflection exercises.",
        price: 14700,
        isFree: false,
        grad: "from-yellow-600 to-orange-600",
        ring: "ring-yellow-400/30",
        sampleUrl: "/samples/Psychology Of Confidenc preview.pdf",
        productId: "68f460ba4ec7a02c82c74c2f",
      }
    ],
    []
  );

  // FIXED: Search filter logic
  const filteredBooks = useMemo(() => {
    if (!debounced) return books;
    
    return books.filter((book) => {
      const titleMatch = book.title.toLowerCase().includes(debounced);
      const descMatch = book.desc.toLowerCase().includes(debounced);
      return titleMatch || descMatch;
    });
  }, [books, debounced]);

  // FIXED: Payment handler
  async function handlePayment(book) {
    if (book.isFree) {
      window.location.href = `/library/free/${book.id}`;
      return;
    }
    
    if (processingId) return;

    console.log('Starting payment for:', book.title);
    setProcessingId(book.id);
    setDownloadToken(null);
    setShowDownload(false);
    setDownloadBook(null);

    try {
      // Validation
      if (!RAZORPAY_KEY_ID) {
        alert("Payment system not configured. Missing Razorpay Key.");
        console.error('Missing RAZORPAY_KEY_ID');
        return;
      }
      
      if (!API_BASE) {
        alert("API connection not configured. Please contact support.");
        console.error('Missing API_BASE');
        return;
      }

      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        alert("Failed to load payment gateway. Please check your internet connection.");
        return;
      }

      console.log('Creating order...');
      
      // Create order
      const orderRes = await fetch(`${API_BASE}/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ebookId: book.productId,
          userEmail: user?.email || "guest@example.com",
        }),
      });

      if (!orderRes.ok) {
        const errorText = await orderRes.text();
        console.error('Order creation failed:', errorText);
        throw new Error(`Order creation failed: ${errorText}`);
      }

      const order = await orderRes.json();
      console.log('Order created successfully:', order);

      if (!order?.orderId) {
        alert("Unable to create order. Please try again.");
        return;
      }

      // Open Razorpay checkout
      const rzp = new window.Razorpay({
        key: order.razorpayKey || RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Vimal Library",
        description: book.title,
        order_id: order.orderId,
        prefill: { 
          name: user?.displayName || "Guest User", 
          email: user?.email || "guest@example.com" 
        },
        theme: { color: "#7c3aed" },
        handler: async function (response) {
          console.log('Payment successful, verifying...', response);
          
          try {
            const verifyRes = await fetch(`${API_BASE}/verify-payment`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            if (!verifyRes.ok) {
              const errorText = await verifyRes.text();
              console.error('Verification failed:', errorText);
              alert(`Payment verification failed: ${errorText}`);
              return;
            }

            const verifyData = await verifyRes.json();
            console.log('Verification successful:', verifyData);

            if (verifyData.success && verifyData.downloadToken) {
              console.log('Setting download state with token:', verifyData.downloadToken);
              
              // Use setTimeout to ensure state updates properly
              setTimeout(() => {
                setDownloadToken(verifyData.downloadToken);
                setDownloadBook(book);
                setShowDownload(true);
                console.log('Download modal should now be visible');
              }, 100);
              
            } else {
              console.error('Invalid verification response:', verifyData);
              alert("Payment verified but download link not generated. Please contact support.");
            }
          } catch (err) {
            console.error('Verification error:', err);
            alert("Payment verification error. Please contact support with your payment ID.");
          }
        },
        modal: {
          ondismiss: function() {
            console.log('Payment cancelled by user');
            setProcessingId(null);
          }
        }
      });

      rzp.open();
      
    } catch (error) {
      console.error('Checkout error:', error);
      alert(`Checkout failed: ${error.message}`);
    } finally {
      setProcessingId(null);
    }
  }

  const headerReveal = useReveal();
  const gridReveal = useReveal();

  return (
    <>
      <ScrollProgress />

      <div className="relative min-h-screen text-white bg-[#0a0a0f] overflow-hidden">
        {/* Animated gradient orbs */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <FloatingParticles />

          <div
            className="absolute w-[500px] h-[500px] rounded-full blur-[140px] opacity-25"
            style={{
              background: "radial-gradient(circle, #8b5cf6 0%, transparent 70%)",
              left: `${15 + mousePos.x * 0.015}%`,
              top: `${10 + mousePos.y * 0.015}%`,
              transition: "all 0.3s ease-out",
            }}
          />
          <div
            className="absolute w-[450px] h-[450px] rounded-full blur-[120px] opacity-20"
            style={{
              background: "radial-gradient(circle, #ec4899 0%, transparent 70%)",
              right: `${20 + mousePos.x * 0.01}%`,
              bottom: `${15 + mousePos.y * 0.01}%`,
              transition: "all 0.3s ease-out",
            }}
          />
          <div
            className="absolute w-[400px] h-[400px] rounded-full blur-[110px] opacity-15"
            style={{
              background: "radial-gradient(circle, #3b82f6 0%, transparent 70%)",
              left: `${40 + mousePos.x * 0.008}%`,
              top: `${40 + mousePos.y * 0.008}%`,
              transition: "all 0.3s ease-out",
            }}
          />
        </div>

        {/* HEADER SECTION */}
        <header
          ref={headerReveal.ref}
          className={`relative mx-auto max-w-7xl px-6 pt-20 pb-12 transition-all duration-1000 ${
            headerReveal.inView
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-12"
          }`}
        >
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-3 px-6 py-3 mb-8 rounded-full bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl group hover:bg-white/10 transition-all duration-500">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="text-sm font-medium text-white/90">
                Premium Library
              </span>
            </div>

            {/* Main heading */}
            <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-6 leading-[1.1]">
              <span className="block bg-gradient-to-br from-white to-white/90 bg-clip-text text-transparent">
                Discover. Preview.
              </span>
              <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
                Own.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-6 text-xl md:text-2xl text-white/70 max-w-3xl mx-auto leading-relaxed">
              Curated ebooks on discipline, focus, and execution
              <br className="hidden md:block" />
              <span className="text-purple-300">
                optimized for reading and doing.
              </span>
            </p>

            {/* Enhanced Search Bar */}
            <div className="mt-12 relative max-w-2xl mx-auto">
              
                
              
    
                
                {/* Search glow effect */}
                <div className="absolute inset-0 -z-10 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-orange-600/20 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
              
              {/* Search results count */}
              {searchTerm && (
                <div className="mt-4 text-sm text-white/60">
                  Found {filteredBooks.length} {filteredBooks.length === 1 ? 'book' : 'books'}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* BOOKS GRID SECTION */}
        <section
          ref={gridReveal.ref}
          className={`relative mx-auto max-w-7xl px-6 pb-32 transition-all duration-1000 ${
            gridReveal.inView
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-12"
          }`}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredBooks.length > 0 ? (
              filteredBooks.map((book, index) => {
                const cardReveal = useReveal(0.1);
                const tiltRef = useTilt(10, true);
                const busy = processingId === book.id;

                return (
                  <article
                    key={book.id}
                    ref={cardReveal.ref}
                    className={`group relative rounded-3xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl transition-all duration-700 hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)] ${
                      cardReveal.inView
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-12"
                    }`}
                    style={{ transitionDelay: `${index * 100}ms` }}
                  >
                    {/* Top accent bar */}
                    <div className={`h-1.5 bg-gradient-to-r ${book.grad}`} />

                    {/* Book cover with 3D tilt */}
                    <div
                      ref={tiltRef}
                      className="relative p-6 transition-transform duration-300"
                      style={{ transformStyle: "preserve-3d" }}
                    >
                      <div
                        className={`relative h-72 rounded-2xl bg-gradient-to-br ${book.grad} flex items-center justify-center overflow-hidden shadow-2xl`}
                      >
                        <img
                          src={book.cover}
                          alt={`${book.title} cover`}
                          className="object-contain max-h-full max-w-full drop-shadow-2xl transform group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        {/* Glare effect */}
                        <div className="glare-effect absolute inset-0 opacity-0 transition-opacity duration-300 pointer-events-none" />
                        {/* Overlay gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="px-6 pb-6">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <h3 className="text-2xl font-black tracking-tight leading-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-300 group-hover:to-pink-300 transition-all duration-300">
                          {book.title}
                        </h3>
                        {/* Favorite button */}
                        <button
                          onClick={() => toggleFav(book.id)}
                          aria-label={
                            isFav(book.id)
                              ? "Remove from favorites"
                              : "Add to favorites"
                          }
                          className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 hover:scale-110 transition-all duration-300 flex items-center justify-center text-2xl"
                          title={
                            isFav(book.id)
                              ? "Remove from favorites"
                              : "Add to favorites"
                          }
                        >
                          {isFav(book.id) ? "❤️" : "🤍"}
                        </button>
                      </div>
                      <p className="text-white/70 text-sm leading-relaxed line-clamp-3 mb-6">
                        {book.desc}
                      </p>
                      
                      {/* Price and badges */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <span
                            className={`text-3xl font-black ${
                              book.isFree
                                ? "text-emerald-400"
                                : "bg-gradient-to-r from-amber-400 to-rose-400 bg-clip-text text-transparent"
                            }`}
                          >
                            {book.isFree
                              ? "Free"
                              : "₹" + (book.price / 100).toFixed(2)}
                          </span>
                          <span
                            className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                              book.isFree
                                ? "bg-emerald-500/15 text-emerald-300 border border-emerald-400/30"
                                : "bg-amber-500/15 text-amber-300 border border-amber-400/30"
                            }`}
                          >
                            {book.isFree ? "FREE" : "PAID"}
                          </span>
                        </div>
                      </div>
                      
                      {/* Action buttons */}
                      <div className="flex gap-3">
                        <button
                          onClick={() => setPreview(book)}
                          className="flex-1 px-4 py-3 rounded-xl border-2 border-white/20 backdrop-blur-xl bg-white/5 hover:bg-white/10 hover:border-white/40 font-semibold text-sm transition-all duration-300"
                          title="Preview this ebook"
                        >
                          Preview
                        </button>
                        <button
                          onClick={() => handlePayment(book)}
                          disabled={busy}
                          className={`flex-1 px-5 py-3 rounded-xl font-bold text-sm bg-gradient-to-r ${book.grad} hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95`}
                        >
                          {book.isFree
                            ? busy
                              ? "Opening..."
                              : "🎁 Get Free"
                            : busy
                            ? "Processing..."
                            : "🛒 Buy Now"}
                        </button>
                      </div>
                    </div>
                    
                    {/* Hover glow effect */}
                    <div className="pointer-events-none absolute -inset-1 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div
                        className={`absolute -inset-1 rounded-3xl bg-gradient-to-r ${book.grad} blur-xl opacity-3`}
                      />
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="col-span-full text-center py-20">
                <div className="inline-block p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10">
                  <svg
                    className="w-20 h-20 mx-auto mb-4 text-white/30"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-xl text-white/60 font-semibold">
                    No ebooks found for{" "}
                    <span className="text-purple-400">"{searchTerm}"</span>
                  </p>
                  <p className="text-sm text-white/40 mt-2">
                    Try a different search term
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* DOWNLOAD MODAL - FIXED */}
          {showDownload && downloadToken && downloadBook && (
            <div
              className="fixed inset-0 z-[2000]  bg-black/95 backdrop-blur-xl flex items-center mb-340  justify-center p-4"
              style={{ animation: "fadeIn 0.3s ease-in" }}
            >
              <div
                className="relative w-full max-w-2xl rounded-3xl bg-gradient-to-br from-emerald-900/90 to-teal-900/80 border-2 border-emerald-400/50 shadow-[0_20px_80px_rgba(16,185,129,0.4)] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between px-8 py-6 border-b border-white/10 bg-black/30 backdrop-blur-xl">
                  <div className="flex items-center gap-4">
                    {downloadBook.cover && (
                      <div className="w-20 h-28 rounded-2xl overflow-hidden shadow-xl flex-shrink-0">
                        <img
                          src={downloadBook.cover}
                          alt={downloadBook.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <h4 className="text-2xl font-black text-white mb-2">
                        {downloadBook.title}
                      </h4>
                      <div className="inline-flex items-center gap-2 text-lg font-bold text-emerald-300">
                        <svg
                          className="w-6 h-6 text-emerald-400 animate-bounce"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Payment Successful!
                      </div>
                      <div className="text-white/60 text-xs mt-1">
                        Your ebook is ready to download. Link valid for 10 minutes.
                      </div>
                    </div>
                  </div>
                  {/* Close Button */}
                  <button
                    onClick={() => {
                      setShowDownload(false);
                      setDownloadToken(null);
                      setDownloadBook(null);
                    }}
                    className="w-12 h-12 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-all duration-300 flex items-center justify-center flex-shrink-0"
                    title="Close"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                
                {/* Action Area */}
                <div className="flex flex-col items-center justify-center py-10 px-8 gap-6">
                  <a
                    href={`${API_BASE}/download/${downloadToken}`}
                    download
                    className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg hover:from-emerald-400 hover:to-teal-400 text-xl font-black text-white transition-all duration-300 transform hover:scale-105 active:scale-95"
                  >
                    <svg
                      className="w-7 h-7"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    Download Ebook Now
                  </a>
                  
                  <div className="text-emerald-200 text-sm font-semibold text-center">
                    ⚠️ Keep this window open until download completes
                  </div>

                  <div className="text-emerald-200 text-sm font-semibold flex items-center gap-2">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Download link expires in 10 minutes
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* PREVIEW MODAL */}
        {preview && (
          <div
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4"
            onClick={() => setPreview(null)}
            style={{ animation: "fadeIn 0.3s ease-in" }}
          >
            <div
              className="relative w-full max-w-6xl h-[90vh] rounded-3xl bg-gradient-to-br from-neutral-900 to-black border border-white/10 shadow-[0_20px_80px_rgba(0,0,0,0.8)] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="relative flex items-center justify-between px-8 py-6 border-b border-white/10 bg-black/40 backdrop-blur-xl">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-xl">
                    <img
                      src={preview.cover}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="text-xl md:text-2xl font-black">
                      {preview.title}
                    </h4>
                    <div
                      className={`text-lg font-bold ${
                        preview.isFree
                          ? "text-emerald-400"
                          : "bg-gradient-to-r from-amber-400 to-rose-400 bg-clip-text text-transparent"
                      }`}
                    >
                      {preview.isFree
                        ? "Free"
                        : `₹${(preview.price / 100).toFixed(2)}`}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handlePayment(preview)}
                    disabled={processingId === preview.id}
                    className={`px-8 py-4 rounded-xl font-bold bg-gradient-to-r ${preview.grad} hover:shadow-[0_0_40px_rgba(168,85,247,0.5)] transition-all duration-300 disabled:opacity-50 transform hover:scale-105`}
                  >
                    {preview.isFree
                      ? processingId === preview.id
                        ? "Opening..."
                        : "🎁 Get Free"
                      : processingId === preview.id
                      ? "Processing..."
                      : "🛒 Buy Now"}
                  </button>
                  <button
                    onClick={() => setPreview(null)}
                    className="w-12 h-12 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-all duration-300 flex items-center justify-center"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
              {/* PDF Viewer */}
              <div className="w-full h-full bg-neutral-950">
                <embed
                  src={preview.sampleUrl}
                  type="application/pdf"
                  className="w-full h-full"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

import React, { useState, useEffect, useRef, createContext, useContext, useMemo, useCallback } from 'react';
import { ChevronDown, Menu, X, Volume2, VolumeX, Youtube, Instagram, MessageCircle, ExternalLink, Send, Globe, Star, Waves, Fish, Compass, Heart, Lock, Unlock } from 'lucide-react';

// Performance and device detection hooks
const useDeviceCapabilities = () => {
  const [capabilities, setCapabilities] = useState({
    isHighPerformance: true,
    prefersReducedMotion: false,
    supportsBackdropFilter: true
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const supportsBackdropFilter = CSS.supports('backdrop-filter', 'blur(10px)');
      
      const isHighPerformance = navigator.hardwareConcurrency >= 4 && 
        (!navigator.deviceMemory || navigator.deviceMemory >= 4);
      
      setCapabilities({
        isHighPerformance,
        prefersReducedMotion,
        supportsBackdropFilter
      });
    }
  }, []);

  return capabilities;
};

// Simple audio management hook
const useAudioManager = () => {
  const [audioEnabled, setAudioEnabled] = useState(false);
  const clickSoundRef = useRef(null);
  const ambientSoundRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      clickSoundRef.current = new Audio('/audio/click.mp3');
      ambientSoundRef.current = new Audio('/audio/distant-waves.mp3');
      
      if (clickSoundRef.current) {
        clickSoundRef.current.volume = 0.3;
      }
      
      if (ambientSoundRef.current) {
        ambientSoundRef.current.loop = true;
        ambientSoundRef.current.volume = 0.15;
      }
    }
  }, []);

  const playClickSound = useCallback(() => {
    if (audioEnabled && clickSoundRef.current) {
      try {
        clickSoundRef.current.currentTime = 0;
        clickSoundRef.current.play().catch(() => {});
      } catch (error) {}
    }
  }, [audioEnabled]);

  const playBubbleSound = useCallback(() => {
    if (audioEnabled && typeof window !== 'undefined') {
      try {
        const bubbleAudio = new Audio('/audio/distant-waves.mp3');
        bubbleAudio.volume = 0.1;
        bubbleAudio.play().catch(() => {});
      } catch (error) {}
    }
  }, [audioEnabled]);

  const toggleAudio = useCallback(() => {
    const newState = !audioEnabled;
    setAudioEnabled(newState);
    
    if (newState && ambientSoundRef.current) {
      ambientSoundRef.current.play().catch(() => {});
    } else if (ambientSoundRef.current) {
      ambientSoundRef.current.pause();
    }
  }, [audioEnabled]);

  return { audioEnabled, playClickSound, playBubbleSound, toggleAudio };
};

// Wave System Component
const WaveSystem = ({ intensity = 'medium', className = '' }) => {
  const { isHighPerformance, prefersReducedMotion } = useDeviceCapabilities();
  
  if (prefersReducedMotion || !isHighPerformance) {
    return <div className={`absolute inset-0 bg-gradient-to-b from-blue-900/20 to-slate-900/40 ${className}`} />;
  }

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-blue-500/30 to-transparent animate-pulse" />
      <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-cyan-400/20 to-transparent animate-pulse animation-delay-1000" />
    </div>
  );
};

// Interactive Bubble System
const BubbleSystem = ({ density = 'medium', className = '' }) => {
  const { isHighPerformance, prefersReducedMotion } = useDeviceCapabilities();
  const [bubbles, setBubbles] = useState([]);

  const bubbleCount = useMemo(() => {
    if (prefersReducedMotion || !isHighPerformance) return 0;
    switch (density) {
      case 'low': return 8;
      case 'medium': return 15;
      case 'high': return 25;
      default: return 15;
    }
  }, [density, isHighPerformance, prefersReducedMotion]);

  useEffect(() => {
    const generateBubbles = () => {
      return Array.from({ length: bubbleCount }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        size: Math.random() * 20 + 5,
        speed: Math.random() * 20 + 10,
        delay: Math.random() * 5,
        opacity: Math.random() * 0.6 + 0.2
      }));
    };

    setBubbles(generateBubbles());
  }, [bubbleCount]);

  if (!isHighPerformance || prefersReducedMotion) return null;

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      {bubbles.map((bubble) => (
        <div
          key={bubble.id}
          className="absolute rounded-full bg-gradient-to-t from-cyan-200/30 to-blue-200/50 backdrop-blur-sm border border-cyan-300/20 animate-bounce"
          style={{
            left: `${bubble.x}%`,
            bottom: '-20px',
            width: `${bubble.size}px`,
            height: `${bubble.size}px`,
            animationDuration: `${bubble.speed}s`,
            animationDelay: `${bubble.delay}s`,
            opacity: bubble.opacity
          }}
        />
      ))}
    </div>
  );
};

// Moving Light System
const MovingLightSystem = ({ className = '' }) => {
  const { isHighPerformance, prefersReducedMotion } = useDeviceCapabilities();

  if (prefersReducedMotion || !isHighPerformance) return null;

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      <div className="absolute w-96 h-96 opacity-20 animate-pulse bg-gradient-radial from-white/20 to-transparent rounded-full top-1/4 left-1/4 blur-3xl" />
    </div>
  );
};

// Enhanced Ripple Button Component
const RippleButton = ({ 
  children, 
  onClick, 
  className = '', 
  variant = 'primary',
  disabled = false,
  ...props 
}) => {
  const [ripples, setRipples] = useState([]);
  const { playClickSound } = useAudioManager();

  const createRipple = useCallback((event) => {
    if (disabled) return;

    const newRipple = { id: Date.now() };
    setRipples(prev => [...prev, newRipple]);
    playClickSound();

    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 600);

    if (onClick) onClick(event);
  }, [disabled, onClick, playClickSound]);

  const baseClasses = "relative overflow-hidden transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/50";
  
  const variantClasses = {
    primary: "bg-gradient-to-r from-cyan-500 via-blue-500 to-teal-500 text-white hover:from-cyan-400 hover:via-blue-400 hover:to-teal-400",
    secondary: "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-400 hover:to-pink-400",
    ghost: "bg-transparent border border-cyan-400/50 text-cyan-300 hover:bg-cyan-400/10 hover:border-cyan-300"
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : 'transform hover:scale-[1.02]'}`}
      onClick={createRipple}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

// Typewriter Text Component
const TypewriterText = ({ text, className, speed = 50 }) => {
  const [displayText, setDisplayText] = useState('');
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < text.length) {
      const timer = setTimeout(() => {
        setDisplayText(prev => prev + text[index]);
        setIndex(index + 1);
      }, speed);
      
      return () => clearTimeout(timer);
    }
  }, [index, text, speed]);

  return (
    <div className={className}>
      {displayText.split('\n').map((line, i) => (
        <div key={i} className={i > 0 ? 'mt-4' : ''}>
          {line}
          {index === text.length && i === displayText.split('\n').length - 1 && (
            <span className="animate-pulse ml-1">|</span>
          )}
        </div>
      ))}
    </div>
  );
};

// Page Transition System
const PageTransition = ({ isTransitioning, children }) => {
  return (
    <div className={`transition-all duration-700 ${isTransitioning ? 'opacity-0 scale-95 blur-sm' : 'opacity-100 scale-100 blur-0'}`}>
      <div className={`transition-transform duration-500 ${isTransitioning ? 'translate-y-8' : 'translate-y-0'}`}>
        {children}
      </div>
      
      {isTransitioning && (
        <div className="fixed inset-0 bg-gradient-to-b from-transparent via-blue-900/50 to-slate-900/80 pointer-events-none z-40" />
      )}
    </div>
  );
};

// Internationalization Context
const I18nContext = createContext();

const useTranslation = () => {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useTranslation must be used within I18nProvider');
  return context;
};

const translations = {
  en: {
    nav: {
      home: 'Home',
      about: 'About Me',
      info: 'My Info',
      toMontion: 'To Montion',
      secretGarden: 'Secret Garden',
      skipToContent: 'Skip to main content',
      toggleMenu: 'Toggle navigation menu',
      toggleLanguage: 'Switch to Arabic',
      toggleAudio: 'Toggle background audio'
    },
    hero: {
      title: 'Discover the Mysteries of the Deep',
      subtitle: 'Join me on an educational adventure through the underwater world, where every dive reveals new secrets and ancient stories beneath the moonlit waves.',
      cta: 'Begin Your Knowledge Dive'
    },
    home: {
      mysteriousEvents: 'Mysterious Deep Sea Events',
      event1Title: 'The Lost City of Atlantis',
      event1Desc: 'Exploring the legendary underwater civilization and uncovering its hidden treasures beneath ancient coral gardens.',
      event2Title: 'Abyssal Creatures of Wonder',
      event2Desc: 'Encountering extraordinary life forms in the ocean\'s deepest trenches, where bioluminescence lights the darkness.',
      event3Title: 'Shipwreck Chronicles',
      event3Desc: 'Revealing untold stories from vessels claimed by time and tide, each wreck a portal to maritime history.',
      suggestTitle: 'Suggest Your Next Dive Adventure',
      titleLabel: 'Dive Topic Suggestion',
      titlePlaceholder: 'What oceanic mystery should we explore next?',
      emailLabel: 'Your Email (Optional)',
      emailPlaceholder: 'your-email@example.com',
      submitSuggestion: 'Submit Your Dive Idea',
      featuredVideo: 'Featured Deep Dive Experience',
      videoDescription: 'Watch our latest underwater exploration revealing the secrets of ancient shipwrecks'
    },
    about: {
      title: 'The Explorer Behind the Deep Dive',
      intro: 'Welcome to my underwater universe, fellow ocean enthusiast!',
      content: [
        'I am a passionate marine explorer and educational content creator, dedicated to unveiling the most captivating mysteries hidden beneath our planet\'s vast oceans. Through my YouTube channel and social media platforms, I craft immersive adventures that seamlessly blend entertainment with meaningful learning experiences.',
        'My mission is elegantly simple yet profoundly important: to inspire others to develop a deep appreciation for the beauty, complexity, and wonder of our marine ecosystems. I aim to foster a vibrant community of curious minds who share an insatiable hunger for oceanic discovery and environmental stewardship.',
        'Together, we embark on extraordinary journeys to explore haunting shipwrecks, encounter magnificent marine creatures, and uncover the countless secrets that lie hidden beneath the waves. Each dive becomes a new chapter in our collective story of discovery, education, and wonder.',
        'Join our growing community of ocean explorers as we dive deeper into knowledge, adventure, and the timeless mysteries of the deep!'
      ],
      subscribeCall: 'Subscribe to Join Our Diving Community',
      communitySize: 'Join 50,000+ Ocean Explorers'
    },
    info: {
      title: 'Connect With Our Ocean Community',
      subtitle: 'Follow my underwater adventures across all platforms and join our growing community of marine enthusiasts',
      platforms: {
        youtube: {
          name: 'YouTube Channel',
          desc: 'In-depth diving documentaries, educational content, and breathtaking underwater cinematography showcasing marine mysteries'
        },
        instagram: {
          name: 'Instagram',
          desc: 'Daily behind-the-scenes moments, stunning underwater photography, and quick diving tips from our ocean adventures'
        },
        tiktok: {
          name: 'TikTok',
          desc: 'Short-form educational content, fascinating marine facts, and bite-sized diving adventures for quick learning'
        },
        discord: {
          name: 'Discord Community',
          desc: 'Join live discussions with fellow divers, participate in Q&A sessions, and connect with our passionate ocean community'
        }
      },
      visitProfile: 'Visit My Profile'
    },
    toMontion: {
      title: 'A Heartfelt Message of Deep Gratitude',
      message: [
        'Dear extraordinary ocean explorers and cherished community members,',
        'As I sit here in quiet contemplation, watching the gentle moonlight dance across the tranquil water\'s surface, my heart overflows with profound gratitude for each and every soul who has joined me on this incredible underwater journey of discovery.',
        'Your unwavering support, boundless curiosity, and shared passion for the mysteries of the deep have transformed what began as a personal adventure into a thriving, vibrant community of dedicated explorers. Every thoughtful comment you share, every moment you spend engaging with our content, and every time you spread the word about our adventures adds another precious layer to the rich tapestry of our collective diving experience.',
        'Through your enthusiasm and participation, you have taught me that the greatest treasures are not hidden in the deepest ocean trenches or within ancient shipwrecks, but rather in the meaningful connections we forge and the knowledge we generously share with one another along this extraordinary journey.',
        'Your infectious enthusiasm continuously fuels my passion to dive deeper into uncharted waters, explore further into the unknown, and bring you even more breathtaking, educational content that inspires wonder and respect for our magnificent oceans.',
        'From the very depths of my heart, I extend my most sincere gratitude for becoming an integral part of this underwater family. Here\'s to countless more dives, amazing discoveries, and magical moments that we will share together as we continue exploring the wonders that lie beneath the waves.',
        'With boundless appreciation and excitement for the adventures that await us in the depths,',
        'Your devoted dive companion and ocean storyteller'
      ],
      closeMessage: 'Return to the Surface'
    },
    secretGarden: {
      lockTitle: 'The Coral Garden Awaits',
      lockSubtitle: 'Only those who know the secret can witness the roses beneath the sea',
      placeholder: 'Enter the secret beneath the waves',
      unlock: 'Unlock',
      wrongCode: 'The depths remain sealed... Try again',
      tooManyAttempts: 'Too many attempts. The garden is protected for 15 minutes.',
      dedication: `In the quiet depths of the ocean
Where roses breathe underwater
And corals bloom in sunset hues

Here... in this secret place
Dreams meet reality
And promises become eternal truth

Just as I promised you...
Here is your coral rose garden
Blooming on the ocean floor
Waiting for you forever`,
      returnToSurface: 'Return to Surface'
    },
    thankYou: {
      title: 'Thank You for Your Dive Suggestion!',
      message: 'Your underwater adventure idea has been successfully received! I\'m genuinely excited to explore this fascinating topic and share the discoveries with our amazing community.',
      backToHome: 'Return to Home Base',
      exploreMore: 'Discover More Ocean Adventures'
    },
    footer: {
      copyright: '© 2024 DiveIn4e Adventures. Exploring oceans, inspiring minds.',
      madeWith: 'Crafted with passion for ocean exploration'
    },
    a11y: {
      loading: 'Content is loading...',
      error: 'An error occurred while loading content',
      imageAlt: 'Underwater scene showing'
    }
  },
  ar: {
    nav: {
      home: 'الرئيسية',
      about: 'من أنا',
      info: 'معلوماتي',
      toMontion: 'إلى مونتيون',
      secretGarden: 'الحديقة السرية',
      skipToContent: 'انتقل للمحتوى الرئيسي',
      toggleMenu: 'تبديل قائمة التنقل',
      toggleLanguage: 'التبديل للإنجليزية',
      toggleAudio: 'تبديل الصوت الخلفي'
    },
    hero: {
      title: 'اكتشف أسرار الأعماق الخفية',
      subtitle: 'انضم إلي في مغامرة تعليمية عبر العالم تحت الماء، حيث تكشف كل غوصة أسراراً جديدة وقصصاً عريقة تحت الأمواج المضيئة بنور القمر.',
      cta: 'ابدأ غوصة المعرفة'
    },
    home: {
      mysteriousEvents: 'الأحداث الغامضة في أعماق البحار',
      event1Title: 'مدينة أطلانطس المفقودة',
      event1Desc: 'استكشاف الحضارة الأسطورية تحت الماء وكشف كنوزها المخفية تحت الحدائق المرجانية العتيقة.',
      event2Title: 'مخلوقات الهاوية المذهلة', 
      event2Desc: 'لقاء أشكال حياة استثنائية في أعمق خنادق المحيط، حيث يضيء التوهج الحيوي الظلام.',
      event3Title: 'سجلات حطام السفن',
      event3Desc: 'كشف قصص لم تُروَ من السفن التي استولى عليها الزمن والمد، كل حطام بوابة لتاريخ بحري عريق.',
      suggestTitle: 'اقترح مغامرة الغوص القادمة',
      titleLabel: 'اقتراح موضوع الغوص',
      titlePlaceholder: 'ما اللغز المحيطي الذي يجب أن نستكشفه تالياً؟',
      emailLabel: 'بريدك الإلكتروني (اختياري)',
      emailPlaceholder: 'your-email@example.com',
      submitSuggestion: 'أرسل فكرة الغوص',
      featuredVideo: 'تجربة الغوص العميق المميزة',
      videoDescription: 'شاهد أحدث استكشافاتنا تحت الماء لكشف أسرار حطام السفن القديمة'
    },
    about: {
      title: 'المستكشف وراء الغوص العميق',
      intro: 'مرحباً بك في عالمي تحت الماء، يا محب المحيط!',
      content: [
        'أنا مستكشف بحري متحمس ومنشئ محتوى تعليمي، مكرس لكشف أكثر الألغاز جاذبية المخفية تحت محيطات كوكبنا الشاسعة. من خلال قناتي على يوتيوب ومنصات التواصل الاجتماعي، أصنع مغامرات غامرة تمزج بسلاسة بين الترفيه وتجارب التعلم المعنوية.',
        'مهمتي بسيطة بأناقة لكنها مهمة بعمق: إلهام الآخرين لتطوير تقدير عميق لجمال وتعقيد وعجائب النظم البيئية البحرية. أهدف لتعزيز مجتمع نابض بالحياة من العقول الفضولية التي تتشارك جوعاً لا يُشبع للاكتشاف المحيطي والإشراف البيئي.',
        'معاً، نشرع في رحلات استثنائية لاستكشاف حطام السفن المؤثر، ولقاء المخلوقات البحرية الرائعة، وكشف الأسرار اللامتناهية المخفية تحت الأمواج. تصبح كل غوصة فصلاً جديداً في قصتنا الجماعية للاكتشاف والتعليم والعجب.',
        'انضم لمجتمعنا المتنامي من مستكشفي المحيط بينما نغوص أعمق في المعرفة والمغامرة وألغاز الأعماق الخالدة!'
      ],
      subscribeCall: 'اشترك للانضمام لمجتمع الغوص',
      communitySize: 'انضم لأكثر من 50,000 مستكشف محيط'
    },
    info: {
      title: 'تواصل مع مجتمع المحيط',
      subtitle: 'تابع مغامراتي تحت الماء عبر جميع المنصات وانضم لمجتمعنا المتنامي من عشاق البحار',
      platforms: {
        youtube: {
          name: 'قناة يوتيوب',
          desc: 'وثائقيات الغوص المتعمقة، والمحتوى التعليمي، والسينما تحت الماء الخلابة التي تعرض ألغاز البحار'
        },
        instagram: {
          name: 'إنستغرام', 
          desc: 'لحظات يومية من وراء الكواليس، تصوير مذهل تحت الماء، ونصائح غوص سريعة من مغامراتنا المحيطية'
        },
        tiktok: {
          name: 'تيك توك',
          desc: 'محتوى تعليمي قصير الشكل، حقائق بحرية مذهلة، ومغامرات غوص مصغرة للتعلم السريع'
        },
        discord: {
          name: 'مجتمع ديسكورد',
          desc: 'انضم للنقاشات الحية مع زملائك الغواصين، شارك في جلسات الأسئلة والأجوبة، وتواصل مع مجتمع المحيط المتحمس'
        }
      },
      visitProfile: 'زيارة الملف الشخصي'
    },
    toMontion: {
      title: 'رسالة صادقة من عمق الامتنان',
      message: [
        'أيها المستكشفون المحيطيون الاستثنائيون وأعضاء المجتمع العزيزون،',
        'بينما أجلس هنا في تأمل هادئ، أراقب ضوء القمر اللطيف يرقص عبر سطح الماء الهادئ، قلبي يفيض بامتنان عميق لكل روح انضمت إلي في هذه الرحلة المذهلة تحت الماء للاكتشاف.',
        'دعمكم الثابت وفضولكم اللامحدود وشغفكم المشترك بألغاز الأعماق حول ما بدأ كمغامرة شخصية إلى مجتمع مزدهر نابض بالحياة من المستكشفين المكرسين. كل تعليق مدروس تشاركونه، وكل لحظة تقضونها في التفاعل مع محتوانا، وكل مرة تنشرون فيها الكلمة عن مغامراتنا تضيف طبقة ثمينة أخرى للنسيج الغني لتجربة الغوص الجماعية.',
        'من خلال حماستكم ومشاركتكم، علمتموني أن أعظم الكنوز لا تختبئ في أعمق خنادق المحيط أو داخل حطام السفن القديمة، بل في الروابط المعنوية التي نشكلها والمعرفة التي نتشاركها بسخاء مع بعضنا البعض على طول هذه الرحلة الاستثنائية.',
        'حماستكم المعدية تغذي باستمرار شغفي للغوص أعمق في المياه غير المستكشفة، واستكشاف أكثر في المجهول، وإحضار محتوى تعليمي خلاب أكثر يلهم العجب والاحترام لمحيطاتنا الرائعة.',
        'من أعماق قلبي، أمد أصدق امتناني لكونكم جزءاً لا يتجزأ من هذه العائلة تحت الماء. نخب لغوصات لا تحصى أكثر، واكتشافات مذهلة، ولحظات سحرية سنتشاركها معاً بينما نواصل استكشاف العجائب التي تكمن تحت الأمواج.',
        'مع تقدير لا حدود له وحماس للمغامرات التي تنتظرنا في الأعماق،',
        'رفيق الغوص المكرس وراوي المحيط'
      ],
      closeMessage: 'العودة إلى السطح'
    },
    secretGarden: {
      lockTitle: 'حديقة المرجان في الانتظار',
      lockSubtitle: 'فقط من يعرف السر يمكنه رؤية الورود تحت البحر',
      placeholder: 'أدخل السر المخفي تحت الأمواج',
      unlock: 'افتح',
      wrongCode: 'الأعماق ما زالت مغلقة... حاول مرة أخرى',
      tooManyAttempts: 'محاولات كثيرة. الحديقة محمية لمدة 15 دقيقة.',
      dedication: `في أعماق المحيط الهادئ
حيث تتنفس الورود تحت الماء
وتزهر المرجانات بألوان الغروب

هنا... في هذا المكان السري
تلتقي الأحلام بالواقع
وتصبح الوعود حقيقة خالدة

تماماً كما وعدتك...
ها هي حديقة الورود المرجانية
تزهر في قاع البحر
في انتظارك إلى الأبد`,
      returnToSurface: 'العودة إلى السطح'
    },
    thankYou: {
      title: 'شكراً لاقتراح الغوص!',
      message: 'تم استلام فكرة مغامرتك تحت الماء بنجاح! أنا متحمس حقاً لاستكشاف هذا الموضوع الرائع ومشاركة الاكتشافات مع مجتمعنا المذهل.',
      backToHome: 'العودة للقاعدة الرئيسية',
      exploreMore: 'اكتشف المزيد من مغامرات المحيط'
    },
    footer: {
      copyright: '© 2024 مغامرات الغوص العميق. نستكشف المحيطات، نلهم العقول.',
      madeWith: 'صُنع بشغف لاستكشاف المحيط'
    },
    a11y: {
      loading: 'يتم تحميل المحتوى...',
      error: 'حدث خطأ أثناء تحميل المحتوى',
      imageAlt: 'مشهد تحت الماء يظهر'
    }
  }
};

// I18nProvider with proper RTL support
const I18nProvider = ({ children }) => {
  const [currentLang, setCurrentLang] = useState(() => {
    if (typeof window === 'undefined') return 'en';
    const savedLang = localStorage?.getItem('preferred-language');
    if (savedLang) return savedLang;
    const browserLang = navigator.language.split('-')[0];
    return browserLang === 'ar' ? 'ar' : 'en';
  });

  const isRTL = currentLang === 'ar';

  const toggleLanguage = () => {
    const newLang = currentLang === 'en' ? 'ar' : 'en';
    setCurrentLang(newLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('preferred-language', newLang);
    }
  };

  const t = (key) => {
    const keys = key.split('.');
    let value = translations[currentLang];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value || key;
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.dir = isRTL ? 'rtl' : 'ltr';
      document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
      document.documentElement.lang = currentLang;
      
      if (isRTL) {
        document.body.style.direction = 'rtl';
        document.body.style.fontFamily = "'Cairo', 'Segoe UI', sans-serif";
      } else {
        document.body.style.direction = 'ltr';
        document.body.style.fontFamily = "'underdove', 'Inter', sans-serif";
      }
    }
  }, [currentLang, isRTL]);

  return (
    <I18nContext.Provider value={{ currentLang, isRTL, toggleLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

// Secret Garden Lock Component
const SecretGardenLock = ({ onUnlock }) => {
  const [code, setCode] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockUntil, setLockUntil] = useState(null);
  const { t } = useTranslation();
  const { playClickSound } = useAudioManager();

  // Check if already locked
  useEffect(() => {
    const savedLockUntil = localStorage.getItem('secretLockUntil');
    if (savedLockUntil) {
      const lockTime = parseInt(savedLockUntil);
      if (new Date().getTime() < lockTime) {
        setIsLocked(true);
        setLockUntil(lockTime);
      } else {
        localStorage.removeItem('secretLockUntil');
      }
    }

    const savedAttempts = localStorage.getItem('secretAttempts');
    if (savedAttempts) {
      setAttempts(parseInt(savedAttempts));
    }
  }, []);

  // Handle lockout timer
  useEffect(() => {
    if (isLocked && lockUntil) {
      const timer = setInterval(() => {
        if (new Date().getTime() >= lockUntil) {
          setIsLocked(false);
          setLockUntil(null);
          setAttempts(0);
          localStorage.removeItem('secretLockUntil');
          localStorage.removeItem('secretAttempts');
          clearInterval(timer);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isLocked, lockUntil]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLocked || !code.trim()) return;

    playClickSound();

    if (code === '080607012025') {
      // Success - unlock and save session
      sessionStorage.setItem('secretUnlocked', 'true');
      localStorage.removeItem('secretAttempts');
      onUnlock();
    } else {
      // Wrong code
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      localStorage.setItem('secretAttempts', newAttempts.toString());
      
      if (newAttempts >= 5) {
        // Lock for 15 minutes
        const lockTime = new Date().getTime() + (15 * 60 * 1000);
        setLockUntil(lockTime);
        setIsLocked(true);
        localStorage.setItem('secretLockUntil', lockTime.toString());
      }
      
      setCode('');
    }
  };

  const remainingTime = isLocked && lockUntil 
    ? Math.ceil((lockUntil - new Date().getTime()) / 60000)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      <BubbleSystem density="low" className="opacity-30" />
      <MovingLightSystem />
      
      <div className="max-w-md w-full bg-slate-800/60 backdrop-blur-2xl rounded-2xl p-8 border border-cyan-400/30 shadow-2xl relative">
        <BubbleSystem density="low" className="opacity-20" />
        
        <div className="text-center mb-8 relative z-10">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center shadow-xl">
            <Lock className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2 font-serif">{t('secretGarden.lockTitle')}</h2>
          <p className="text-cyan-200 text-sm leading-relaxed">{t('secretGarden.lockSubtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="mb-6 relative z-10">
          <input
            type="password"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={t('secretGarden.placeholder')}
            className="w-full px-4 py-3 bg-slate-700/50 border border-cyan-400/30 rounded-lg text-white placeholder-cyan-300/50 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 backdrop-blur-sm"
            disabled={isLocked}
          />
          
          {attempts > 0 && attempts < 5 && (
            <p className="text-red-400 text-sm mt-2">{t('secretGarden.wrongCode')} ({5 - attempts} attempts remaining)</p>
          )}
          
          {isLocked && (
            <p className="text-red-400 text-sm mt-2">
              {t('secretGarden.tooManyAttempts')} {remainingTime} minutes remaining.
            </p>
          )}

          <RippleButton
            type="submit"
            disabled={isLocked || !code.trim()}
            className="w-full mt-4 px-6 py-3 rounded-lg font-semibold"
          >
            <Unlock className="w-5 h-5 mr-2 rtl:ml-2 rtl:mr-0" />
            {t('secretGarden.unlock')}
          </RippleButton>
        </form>
      </div>
    </div>
  );
};

// Secret Garden Main Component
const SecretGarden = () => {
  const [currentImage, setCurrentImage] = useState(0);
  const [showText, setShowText] = useState(false);
  const { t, isRTL } = useTranslation();
  const { playBubbleSound } = useAudioManager();

  // Coral garden images - fallback to placeholder gradients
  const images = [
    { 
      src: '/images/secret-garden/coral-garden-1.jpg',
      gradient: 'from-pink-500 via-rose-400 to-red-500'
    },
    { 
      src: '/images/secret-garden/coral-garden-2.jpg',
      gradient: 'from-purple-500 via-pink-400 to-rose-500'
    },
    { 
      src: '/images/secret-garden/coral-garden-3.jpg',
      gradient: 'from-orange-500 via-pink-400 to-purple-500'
    },
    { 
      src: '/images/secret-garden/coral-garden-4.jpg',
      gradient: 'from-red-500 via-pink-400 to-orange-500'
    }
  ];

  // Slideshow effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 8000);
    
    const textTimer = setTimeout(() => setShowText(true), 2000);
    
    return () => {
      clearInterval(interval);
      clearTimeout(textTimer);
    };
  }, []);

  // Play gentle bubble sounds
  useEffect(() => {
    playBubbleSound();
  }, [playBubbleSound]);

  const handleReturn = () => {
    // Clear session on return
    sessionStorage.removeItem('secretUnlocked');
    window.location.reload(); // Force page reload to go back to home
  };
  
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Slideshow */}
      {images.map((image, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-2000 ${
            index === currentImage ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <img
            src={image.src}
            alt={`Coral garden ${index + 1}`}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to gradient background if image fails
              e.target.style.display = 'none';
              e.target.parentElement.className += ` bg-gradient-to-br ${image.gradient}`;
            }}
          />
        </div>
      ))}
      
      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-black/30" />
      
      {/* Enhanced underwater effects */}
      <BubbleSystem density="high" className="opacity-60" />
      <MovingLightSystem />
      
      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="max-w-3xl text-center">
          {/* Dedication Text with Typewriter Effect */}
          {showText && (
            <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl p-8 lg:p-12 border border-white/20 shadow-2xl relative overflow-hidden">
              <BubbleSystem density="low" className="opacity-30" />
              
              <div className="relative z-10">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full mb-6 shadow-xl">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                
                <TypewriterText
                  text={t('secretGarden.dedication')}
                  className="text-white text-lg md:text-xl leading-relaxed font-medium text-center"
                  speed={50}
                />
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Return Button */}
      <div className={`absolute bottom-8 ${isRTL ? 'left-8' : 'right-8'} z-20`}>
        <RippleButton
          onClick={handleReturn}
          variant="ghost"
          className="bg-slate-800/60 backdrop-blur-md text-white px-6 py-3 rounded-lg border border-white/20 hover:bg-slate-700/60 font-semibold"
        >
          <Compass className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
          {t('secretGarden.returnToSurface')}
        </RippleButton>
      </div>
      
      {/* Image indicator dots */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
        {images.map((_, index) => (
          <div
            key={index}
            className={`w-3 h-3 rounded-full transition-all duration-500 ${
              index === currentImage ? 'bg-white/80 scale-125' : 'bg-white/40'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

// Main Website Component
const DivingWebsite = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [suggestionForm, setSuggestionForm] = useState({ title: '', email: '' });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Secret Garden states
  const [secretUnlocked, setSecretUnlocked] = useState(false);
  
  const { t, isRTL, toggleLanguage, currentLang } = useTranslation();
  const { audioEnabled, playClickSound, toggleAudio } = useAudioManager();

  // Check if secret garden is unlocked
  useEffect(() => {
    const unlocked = sessionStorage.getItem('secretUnlocked');
    if (unlocked === 'true') {
      setSecretUnlocked(true);
    }
  }, []);

  const validateForm = () => {
    const errors = {};
    if (!suggestionForm.title.trim()) {
      errors.title = 'Please enter your dive suggestion';
    }
    if (suggestionForm.email && !/\S+@\S+\.\S+/.test(suggestionForm.email)) {
      errors.email = 'Please enter a valid email address';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = useCallback((field, value) => {
    setSuggestionForm(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [formErrors]);

  const handleSuggestionSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    playClickSound();
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      handleNavigation('thank-you');
      setSuggestionForm({ title: '', email: '' });
      setFormErrors({});
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNavigation = useCallback((page) => {
    if (currentPage === page) return;
    
    setIsTransitioning(true);
    playClickSound();
    
    setTimeout(() => {
      setCurrentPage(page);
      setIsTransitioning(false);
      setIsMobileMenuOpen(false);
    }, 350);
  }, [currentPage, playClickSound]);

  const handleSecretUnlock = () => {
    setSecretUnlocked(true);
    setCurrentPage('secret-garden');
  };

  // Event Card Component
  const EventCard = ({ title, description, delay = 0, imageFile }) => (
    <article className="group relative overflow-hidden rounded-2xl bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 hover:border-cyan-400/40 transition-all duration-500 hover:scale-[1.02]">
      <div className="aspect-video relative overflow-hidden bg-slate-700">
        <img 
          src={`/images/${imageFile}`}
          alt={title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.parentElement.className += ' bg-gradient-to-br from-blue-600 to-teal-600';
          }}
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          <Fish className="w-12 h-12 text-white" />
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="font-bold text-lg text-white mb-3 group-hover:text-cyan-300 transition-colors duration-300 font-serif">
          {title}
        </h3>
        <p className="text-slate-300 leading-relaxed text-sm group-hover:text-slate-200 transition-colors duration-300">
          {description}
        </p>
      </div>
    </article>
  );

  // Enhanced Header Component with Secret Garden
  const Header = () => (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800/60" role="banner">
      <WaveSystem intensity="low" className="opacity-30" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex items-center justify-between h-16">
          <RippleButton
            onClick={() => handleNavigation('home')}
            variant="ghost"
            className="text-2xl font-bold text-cyan-400 hover:text-cyan-300 px-3 py-2 font-serif"
          >
            <span className="flex items-center">
              <Compass className="w-6 h-6 mr-2 rtl:ml-2 rtl:mr-0" />
              DiveIn4e
            </span>
          </RippleButton>
          
          <nav className="hidden md:flex items-center space-x-1 rtl:space-x-reverse">
            {['home', 'about', 'info', 'toMontion', 'secretGarden'].map((page) => (
              <RippleButton
                key={page}
                onClick={() => {
                  if (page === 'secretGarden') {
                    if (secretUnlocked) {
                      handleNavigation('secret-garden');
                    } else {
                      setCurrentPage('secret-garden');
                    }
                  } else {
                    handleNavigation(page);
                  }
                }}
                variant="ghost"
                className={`px-4 py-2 rounded-lg text-sm font-medium min-h-[44px] min-w-[44px] ${
                  currentPage === page || (page === 'secretGarden' && currentPage === 'secret-garden')
                    ? 'text-cyan-400 bg-cyan-400/15 shadow-inner border-cyan-400/50'
                    : 'text-slate-300 hover:text-cyan-300 hover:bg-slate-800/70'
                } ${page === 'secretGarden' ? 'border border-pink-400/30 text-pink-300 hover:text-pink-200 hover:border-pink-300/50' : ''}`}
              >
                {page === 'secretGarden' && <Heart className="w-4 h-4 mr-1 rtl:ml-1 rtl:mr-0" />}
                {t(`nav.${page}`)}
              </RippleButton>
            ))}
          </nav>

          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <RippleButton
              onClick={toggleAudio}
              variant="ghost"
              className="p-2 rounded-lg text-slate-300 hover:text-cyan-300 hover:bg-slate-800/70 min-h-[44px] min-w-[44px]"
            >
              {audioEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </RippleButton>
            
            <RippleButton
              onClick={toggleLanguage}
              variant="ghost"
              className="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-cyan-300 hover:bg-slate-800/70 min-h-[44px]"
            >
              <Globe size={16} className="mr-1 rtl:ml-1 rtl:mr-0" />
              {currentLang === 'en' ? 'عربي' : 'EN'}
            </RippleButton>

            <RippleButton
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              variant="ghost"
              className="md:hidden p-2 rounded-lg text-slate-300 hover:text-cyan-300 hover:bg-slate-800/70 min-h-[44px] min-w-[44px]"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </RippleButton>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden bg-slate-900/98 backdrop-blur-xl border-t border-slate-800/60">
          <nav className="px-4 py-4 space-y-1">
            {['home', 'about', 'info', 'toMontion', 'secretGarden'].map((page) => (
              <RippleButton
                key={page}
                onClick={() => {
                  if (page === 'secretGarden') {
                    if (secretUnlocked) {
                      handleNavigation('secret-garden');
                    } else {
                      setCurrentPage('secret-garden');
                    }
                  } else {
                    handleNavigation(page);
                  }
                }}
                variant="ghost"
                className={`block w-full text-left px-4 py-3 rounded-lg text-sm font-medium ${
                  currentPage === page || (page === 'secretGarden' && currentPage === 'secret-garden')
                    ? 'text-cyan-400 bg-cyan-400/15 border-cyan-400/50'
                    : 'text-slate-300 hover:text-cyan-300 hover:bg-slate-800/70'
                } ${page === 'secretGarden' ? 'border border-pink-400/30 text-pink-300' : ''}`}
              >
                {page === 'secretGarden' && <Heart className="w-4 h-4 mr-1 rtl:ml-1 rtl:mr-0 inline" />}
                {t(`nav.${page}`)}
              </RippleButton>
            ))}
          </nav>
        </div>
      )}
    </header>
  );

  // Hero Section
  const HeroSection = () => (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900" />
      
      <WaveSystem intensity="high" />
      <BubbleSystem density="medium" />
      <MovingLightSystem />

      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-8 leading-tight font-serif bg-gradient-to-b from-white to-cyan-200 bg-clip-text text-transparent drop-shadow-2xl">
          {t('hero.title')}
        </h1>
        <p className="text-xl sm:text-2xl lg:text-3xl text-slate-200 mb-12 leading-relaxed max-w-4xl mx-auto font-light">
          {t('hero.subtitle')}
        </p>
        
        <RippleButton
          onClick={() => {
            document.getElementById('main-content')?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="group px-10 py-5 rounded-full text-lg font-semibold shadow-2xl min-h-[56px]"
        >
          {t('hero.cta')}
          <ChevronDown className={`w-6 h-6 ${isRTL ? 'mr-3' : 'ml-3'} group-hover:animate-bounce transition-transform duration-300`} />
        </RippleButton>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-900 to-transparent pointer-events-none" />
    </section>
  );

  // Home Page
  const HomePage = () => (
    <div className="bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900 min-h-screen">
      <HeroSection />
      
      <main id="main-content" className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <WaveSystem intensity="low" className="opacity-20" />
        <BubbleSystem density="low" className="opacity-40" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <section className="mb-20">
            <h2 className="text-4xl font-bold text-white mb-4 text-center font-serif bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              {t('home.mysteriousEvents')}
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <EventCard 
                title={t('home.event1Title')}
                description={t('home.event1Desc')}
                delay={100}
                imageFile="event1.webp"
              />
              <EventCard 
                title={t('home.event2Title')}
                description={t('home.event2Desc')}
                delay={200}
                imageFile="event2.webp"
              />
              <EventCard 
                title={t('home.event3Title')}
                description={t('home.event3Desc')}
                delay={300}
                imageFile="event3.webp"
              />
            </div>
          </section>

          <section className="mb-20">
            <div className="max-w-3xl mx-auto">
              <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-3xl p-8 lg:p-12 border border-slate-700/60 shadow-2xl relative overflow-hidden">
                <BubbleSystem density="low" className="opacity-30" />
                
                <div className="text-center mb-8 relative z-10">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full mb-4">
                    <Send className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-3 font-serif">
                    {t('home.suggestTitle')}
                  </h2>
                </div>
                
                <form onSubmit={handleSuggestionSubmit} className="space-y-6 relative z-10">
                  <div>
                    <label className="block text-sm font-semibold text-slate-200 mb-3">
                      {t('home.titleLabel')} *
                    </label>
                    <input
                      type="text"
                      placeholder={t('home.titlePlaceholder')}
                      value={suggestionForm.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className={`w-full px-6 py-4 bg-slate-700/60 border rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 text-lg backdrop-blur-sm ${
                        formErrors.title ? 'border-red-400 focus:ring-red-400/50' : 'border-slate-600/50 focus:ring-cyan-400/60'
                      }`}
                      required
                    />
                    {formErrors.title && (
                      <p className="mt-2 text-red-400 text-sm">
                        {formErrors.title}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-slate-200 mb-3">
                      {t('home.emailLabel')}
                    </label>
                    <input
                      type="email"
                      placeholder={t('home.emailPlaceholder')}
                      value={suggestionForm.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`w-full px-6 py-4 bg-slate-700/60 border rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 text-lg backdrop-blur-sm ${
                        formErrors.email ? 'border-red-400 focus:ring-red-400/50' : 'border-slate-600/50 focus:ring-cyan-400/60'
                      }`}
                    />
                    {formErrors.email && (
                      <p className="mt-2 text-red-400 text-sm">
                        {formErrors.email}
                      </p>
                    )}
                  </div>
                  
                  <RippleButton
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full px-8 py-5 rounded-xl text-lg font-semibold shadow-xl min-h-[56px] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin mr-3 rtl:ml-3 rtl:mr-0" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className={`w-6 h-6 ${isRTL ? 'ml-3' : 'mr-3'}`} />
                        {t('home.submitSuggestion')}
                      </>
                    )}
                  </RippleButton>
                </form>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-white mb-8 text-center font-serif">
              {t('home.featuredVideo')}
            </h2>
            <div className="max-w-5xl mx-auto">
              <div className="relative group">
                <iframe
                  className="aspect-video w-full rounded-2xl border border-slate-700/60 shadow-2xl group-hover:border-cyan-400/40 transition-all duration-500 relative z-10"
                  src="https://www.youtube.com/embed/n1Nkaqf88SU"
                  title={t('home.videoDescription')}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );

  // About Page
  const AboutPage = () => (
    <main className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900 min-h-screen relative">
      <WaveSystem intensity="medium" className="opacity-30" />
      <BubbleSystem density="medium" className="opacity-50" />
      <MovingLightSystem />
      
      <div className="max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full mb-6 shadow-2xl">
            <Fish className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-6 font-serif bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            {t('about.title')}
          </h1>
          <p className="text-2xl text-cyan-300 font-light max-w-3xl mx-auto">
            {t('about.intro')}
          </p>
        </div>
        
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-3xl p-8 lg:p-16 border border-slate-700/60 shadow-2xl mb-12 relative overflow-hidden">
          <BubbleSystem density="low" className="opacity-20" />
          
          <div className="prose prose-invert prose-lg max-w-none relative z-10">
            {t('about.content').map((paragraph, index) => (
              <p key={index} className="text-slate-300 leading-relaxed mb-8 text-lg last:mb-12">
                {paragraph}
              </p>
            ))}
          </div>
          
          <div className="text-center space-y-6 relative z-10">
            <RippleButton
              onClick={() => window.open('https://www.youtube.com/@divein4e', '_blank')}
              variant="secondary"
              className="px-10 py-5 rounded-full text-lg font-semibold shadow-2xl min-h-[56px] bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
            >
              <Youtube className={`w-6 h-6 ${isRTL ? 'ml-3' : 'mr-3'}`} />
              {t('about.subscribeCall')}
            </RippleButton>
          </div>
        </div>
      </div>
    </main>
  );

  // Info Page
  const socialPlatforms = [
    { 
      key: 'youtube', 
      icon: Youtube, 
      url: 'https://www.youtube.com/@divein4e',
      color: 'from-red-500 to-red-600'
    },
    { 
      key: 'instagram', 
      icon: Instagram, 
      url: 'https://www.instagram.com/search.cr',
      color: 'from-pink-500 to-purple-600'
    },
    { 
      key: 'tiktok', 
      icon: MessageCircle, 
      url: 'https://www.tiktok.com/@divein4e',
      color: 'from-purple-500 to-pink-500'
    },
    { 
      key: 'discord', 
      icon: MessageCircle, 
      url: 'https://discord.gg/WNCgGfg3',
      color: 'from-indigo-500 to-purple-600'
    }
  ];

  const InfoPage = () => (
    <main className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900 min-h-screen relative">
      <WaveSystem intensity="medium" className="opacity-25" />
      <BubbleSystem density="medium" className="opacity-40" />
      
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-6 shadow-2xl">
            <MessageCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-6 font-serif bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            {t('info.title')}
          </h1>
          <p className="text-xl text-slate-300 max-w-4xl mx-auto leading-relaxed">
            {t('info.subtitle')}
          </p>
        </div>
        
        <div className="grid sm:grid-cols-2 gap-8">
          {socialPlatforms.map((platform, index) => (
            <RippleButton
              key={index}
              onClick={() => window.open(platform.url, '_blank')}
              variant="ghost"
              className="group block p-8 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-700/60 hover:border-cyan-400/40 shadow-xl text-left relative overflow-hidden"
            >
              <BubbleSystem density="low" className="opacity-20" />
              
              <div className="flex items-start space-x-6 rtl:space-x-reverse relative z-10">
                <div className={`p-4 rounded-2xl bg-gradient-to-r ${platform.color} group-hover:shadow-2xl transition-all duration-500 flex-shrink-0`}>
                  <platform.icon className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-semibold text-white group-hover:text-cyan-300 transition-colors duration-300 mb-3 flex items-center font-serif">
                    {t(`info.platforms.${platform.key}.name`)}
                    <ExternalLink className={`w-5 h-5 opacity-0 group-hover:opacity-100 transition-all duration-500 ${isRTL ? 'mr-3' : 'ml-3'}`} />
                  </h3>
                  <p className="text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors duration-300">
                    {t(`info.platforms.${platform.key}.desc`)}
                  </p>
                </div>
              </div>
            </RippleButton>
          ))}
        </div>
      </div>
    </main>
  );

  // To Montion Page
  const ToMontionPage = () => (
    <main className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/60 via-pink-900/40 to-slate-900/80">
        <div className="absolute inset-0 opacity-20">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-gradient-to-r from-pink-400/30 to-purple-400/30 blur-xl animate-pulse"
              style={{
                width: `${Math.random() * 60 + 20}px`,
                height: `${Math.random() * 60 + 20}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`
              }}
            />
          ))}
        </div>
      </div>

      <BubbleSystem density="high" className="opacity-30" />
      <MovingLightSystem />

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-2xl rounded-3xl p-8 lg:p-16 border border-pink-500/20 shadow-2xl relative overflow-hidden">
            <BubbleSystem density="low" className="opacity-20" />
            
            <div className="mb-12 relative z-10">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full mb-6 shadow-2xl">
                <Heart className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-8 font-serif bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                {t('toMontion.title')}
              </h1>
            </div>
            
            <div className="prose prose-invert prose-lg max-w-none text-left relative z-10">
              {t('toMontion.message').map((paragraph, index) => (
                <p key={index} className="text-slate-300 leading-relaxed mb-6 text-lg last:mb-12">
                  {paragraph}
                </p>
              ))}
            </div>
            
            <RippleButton
              onClick={() => handleNavigation('home')}
              variant="secondary"
              className="px-10 py-5 rounded-full text-lg font-semibold shadow-2xl min-h-[56px] bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-400 hover:via-purple-400 hover:to-indigo-400 relative z-10"
            >
              <Compass className={`w-6 h-6 ${isRTL ? 'ml-3' : 'mr-3'}`} />
              {t('toMontion.closeMessage')}
            </RippleButton>
          </div>
        </div>
      </div>
    </main>
  );

  // Thank You Page
  const ThankYouPage = () => (
    <main className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 min-h-screen flex items-center justify-center relative">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/90 via-blue-950/80 to-slate-900/90" />
      
      <WaveSystem intensity="medium" className="opacity-40" />
      <BubbleSystem density="medium" className="opacity-50" />
      <MovingLightSystem />
      
      <div className="max-w-3xl mx-auto text-center relative z-10">
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-3xl p-8 lg:p-16 border border-slate-700/60 shadow-2xl relative overflow-hidden">
          <BubbleSystem density="low" className="opacity-20" />
          
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-8 shadow-2xl">
              <Send className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-8 font-serif bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              {t('thankYou.title')}
            </h1>
            
            <p className="text-xl text-slate-300 leading-relaxed mb-12 max-w-2xl mx-auto">
              {t('thankYou.message')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <RippleButton
                onClick={() => handleNavigation('home')}
                className="px-8 py-4 rounded-xl font-semibold shadow-xl min-h-[56px] bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400"
              >
                <Compass className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {t('thankYou.backToHome')}
              </RippleButton>
              
              <RippleButton
                onClick={() => handleNavigation('about')}
                variant="secondary"
                className="px-8 py-4 rounded-xl font-semibold shadow-xl min-h-[56px] bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400"
              >
                <Fish className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {t('thankYou.exploreMore')}
              </RippleButton>
            </div>
          </div>
        </div>
      </div>
    </main>
  );

  // Footer
  const Footer = () => (
    <footer className="bg-slate-900/95 backdrop-blur-xl border-t border-slate-800/60 py-8 relative overflow-hidden">
      <WaveSystem intensity="low" className="opacity-10" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center">
          <p className="text-slate-400 mb-2">{t('footer.copyright')}</p>
          <p className="text-slate-500 text-sm">{t('footer.madeWith')}</p>
        </div>
      </div>
    </footer>
  );

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'about':
        return <AboutPage />;
      case 'info':
        return <InfoPage />;
      case 'toMontion':
        return <ToMontionPage />;
      case 'thank-you':
        return <ThankYouPage />;
      case 'secret-garden':
        return secretUnlocked ? <SecretGarden /> : <SecretGardenLock onUnlock={handleSecretUnlock} />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white overflow-x-hidden">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes ripple {
          0% { transform: scale(0); opacity: 1; }
          100% { transform: scale(4); opacity: 0; }
        }
        
        .animate-ripple { animation: ripple 0.6s linear; }
        
        .font-serif {
          font-family: 'underdove', 'Times New Roman', Georgia, serif;
        }
        
        @media (prefers-reduced-motion: reduce) {
          .animate-pulse,
          .animate-bounce,
          .animate-ripple {
            animation: none;
          }
          
          .transition-transform,
          .transition-all {
            transition: none;
          }
        }
        
        @supports not (backdrop-filter: blur(10px)) {
          .backdrop-blur-xl,
          .backdrop-blur-2xl {
            background-color: rgba(15, 23, 42, 0.85);
          }
        }
      `}} />
      
      <Header />
      
      <PageTransition isTransitioning={isTransitioning}>
        {renderCurrentPage()}
      </PageTransition>

      <Footer />

      {isSubmitting && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 shadow-2xl relative">
            <BubbleSystem density="low" className="opacity-30" />
            <div className="flex items-center space-x-3 relative z-10">
              <div className="w-6 h-6 border-2 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin"></div>
              <span className="text-white font-medium">Submitting your dive suggestion...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const App = () => {
  return (
    <I18nProvider>
      <DivingWebsite />
    </I18nProvider>
  );
};

export default App;
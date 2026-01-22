export default function LogisticsMapSection() {
  return (
    <section className="py-24 bg-black/20 backdrop-blur-3xl">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-16">
        <div className="flex-1">
          <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
            Глобальна мережа <br /> 
            <span className="text-teal-400 text-gradient bg-gradient-to-r from-teal-400 to-indigo-400 bg-clip-text text-transparent">
              у вашому смартфоні
            </span>
          </h2>
          <p className="text-slate-400 text-lg mb-8">
            Ми об'єднуємо тисячі перевізників та вантажовідправників по всій Україні та Європі. 
            Керуйте міжнародними перевезеннями так само легко, як міськими кур'єрами.
          </p>
          <ul className="space-y-4">
            {['Живий моніторинг GPS', 'Митна підтримка AI', 'Миттєві сповіщення'].map((item, i) => (
              <li key={i} className="flex items-center text-white font-medium">
                <div className="w-2 h-2 rounded-full bg-teal-500 mr-3" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        
        <div className="flex-1 relative w-full aspect-square md:aspect-video rounded-3xl overflow-hidden border border-white/10 group">
            {/* Тут можна вставити реальну карту або стилізоване фото */}
          <img 
            src="https://images.unsplash.com/photo-1524522173746-f628baad3644?q=80&w=1531&auto=format&fit=crop" 
            alt="Map"
            className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent" />
          <div className="absolute bottom-6 left-6 p-4 bg-black/60 backdrop-blur-md rounded-xl border border-white/10">
            <p className="text-xs text-teal-400 font-mono">LIVE_TRACKING_ACTIVE</p>
            <p className="text-white text-sm">247 активних рейсів зараз</p>
          </div>
        </div>
      </div>
    </section>
  );
}
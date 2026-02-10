
interface HeroSectionProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedDepartment: string;
  setSelectedDepartment: (dept: string) => void;
}

export default function HeroSection({ 
  searchTerm, 
  setSearchTerm, 
  selectedDepartment, 
  setSelectedDepartment 
}: HeroSectionProps) {
  return (
    <section className="relative pt-32 pb-20 px-6 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img 
          src="https://readdy.ai/api/search-image?query=modern%20professional%20government%20office%20building%20with%20clean%20architecture%20blue%20sky%20background%20minimalist%20design%20administrative%20headquarters%20contemporary%20style&width=1920&height=800&seq=hero-bg-001&orientation=landscape"
          alt="Hero Background"
          className="w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/40"></div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
          HODs & Commissioners Directory
        </h1>
        <p className="text-xl text-white/90 mb-12 max-w-3xl mx-auto">
          Access comprehensive information about department heads, commissioners, and their responsibilities in one centralized platform
        </p>
        
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <i className="ri-search-line absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg"></i>
              <input
                type="text"
                placeholder="Search by name, CFMS ID, Employee ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
              />
            </div>
            
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="px-6 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm cursor-pointer bg-white"
            >
              <option value="all">All Departments</option>
              <option value="administration">Administration</option>
              <option value="finance">Finance</option>
              <option value="operations">Operations</option>
              <option value="planning">Planning</option>
              <option value="technical">Technical</option>
              <option value="legal">Legal</option>
            </select>
          </div>
        </div>
      </div>
    </section>
  );
}

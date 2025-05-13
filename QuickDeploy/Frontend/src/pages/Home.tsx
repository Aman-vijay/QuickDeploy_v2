import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { ArrowRight, Code, Zap, Globe, BarChart, Check, Server } from 'lucide-react';
import { Button } from '../components/Buttons';

const Home = () => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-32">
        <div className="container mx-auto px-4 text-center">
          <div 
            className={`transform transition-all duration-1000 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}
          >
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Deploy your projects in <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">seconds</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-10">
              QuickDeploy gives you the fastest way to deploy your web applications, APIs, and static websites. No complex configuration needed.
            </p>
            
            <Button to="/login" variant="primary" size="lg" icon={<ArrowRight size={20} />}>
  Get Started
        </Button>
          </div>
          
          <div 
            className={`mt-16 max-w-4xl mx-auto rounded-xl overflow-hidden shadow-2xl transition-all duration-1000 delay-300 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}
          >
            {/* Mockup Dashboard Image */}
            <div className="relative bg-gray-800 p-2 rounded-t-xl">
              <div className="flex space-x-2 absolute top-4 left-4">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <div className="mt-6 rounded-lg overflow-hidden bg-gray-900">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-white text-xl font-bold">My Projects</h3>
                      <p className="text-gray-400 text-sm">Deploy and manage your applications</p>
                    </div>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium">+ New Project</button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((item) => (
                      <div key={item} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-white font-medium">Project {item}</h4>
                            <p className="text-gray-400 text-xs">Last deployed 2h ago</p>
                          </div>
                          <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Live</div>
                        </div>
                        <div className="mt-3 flex justify-between items-center">
                          <div className="text-gray-400 text-xs">quickdeploy.app/project-{item}</div>
                          <button className="text-blue-400 text-xs">Settings</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Everything you need to deploy with confidence
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Our platform offers a complete set of tools to streamline your deployment workflow
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { 
                icon: <Code size={24} className="text-blue-600" />, 
                title: 'Git Integration', 
                description: 'Connect your GitHub, GitLab, or Bitbucket repositories and deploy with every push.' 
              },
              { 
                icon: <Zap size={24} className="text-blue-600" />, 
                title: 'Instant Deployments', 
                description: 'Go from code to production in seconds with our optimized build pipeline.' 
              },
              { 
                icon: <Globe size={24} className="text-blue-600" />, 
                title: 'Global CDN', 
                description: 'Serve your applications from edge locations worldwide for the best performance.' 
              },
              { 
                icon: <BarChart size={24} className="text-blue-600" />, 
                title: 'Analytics & Monitoring', 
                description: 'Get insights into your application performance and user behavior.' 
              },
              { 
                icon: <Server size={24} className="text-blue-600" />, 
                title: 'Serverless Functions', 
                description: 'Deploy backend logic without managing servers or infrastructure.' 
              },
              { 
                icon: <Check size={24} className="text-blue-600" />, 
                title: 'Preview Deployments', 
                description: 'Test changes in isolated environments before merging to production.' 
              },
            ].map((feature, index) => (
              <div 
                key={index} 
                className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-700"
              >
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to deploy faster?</h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-10">
              Join thousands of developers who trust QuickDeploy for their applications.
            </p>
            <Button to="/login" variant="secondary" size="lg">
              Get Started for Free
            </Button>
              
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
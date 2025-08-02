import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkflowStore } from '../stores/workflowStore';
import { Loader2, AlertCircle } from 'lucide-react';
import { useProgressMessages, type ProgressMessage } from '../services/progressMessages';
import './ReportGeneration.css';

const ReportGeneration = () => {
  const navigate = useNavigate();
  const { selectedTemplate, selectedDataSource, formData } = useWorkflowStore();
  const [status, setStatus] = useState<'preparing' | 'generating' | 'error'>('preparing');
  const [error, setError] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState<ProgressMessage>({ message: "🎭 Calling the magic spirits...", emoji: "✨", stage: "init", category: "mystical" });
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [showCancelWarning, setShowCancelWarning] = useState(false);

  const { getMessageForProgress, getCancelWarningMessage, clearHistory, getMessageByCategory } = useProgressMessages();

  useEffect(() => {
    // Start the generation process
    generateReports();
    setStartTime(Date.now());
  }, []);

  // Update progress messages periodically
  useEffect(() => {
    // Define our own message arrays for guaranteed variety
    const initMessages = [
      { message: "🎭 Calling the magic spirits...", emoji: "✨", stage: "init", category: "mystical" },
      { message: "🔮 Awakening the AI overlords...", emoji: "🤖", stage: "init", category: "tech" },
      { message: "🧙‍♂️ Brewing some digital potions...", emoji: "⚗️", stage: "init", category: "mystical" },
      { message: "🚀 Launching rockets to the cloud...", emoji: "☁️", stage: "init", category: "space" },
      { message: "⚡ Charging up the neural networks...", emoji: "⚡", stage: "init", category: "tech" },
      { message: "🌟 Gathering stardust for your report...", emoji: "🌟", stage: "init", category: "space" },
      { message: "🎨 Preparing the digital canvas...", emoji: "🎨", stage: "init", category: "creative" },
    ];

    const processingMessages = [
      { message: "🤖 Teaching robots to write poetry...", emoji: "📝", stage: "processing", category: "creative" },
      { message: "🧠 Feeding data to hungry algorithms...", emoji: "🍽️", stage: "processing", category: "tech" },
      { message: "⚡ Channeling lightning into words...", emoji: "⚡", stage: "processing", category: "mystical" },
      { message: "🎨 Painting masterpieces with code...", emoji: "🖼️", stage: "processing", category: "creative" },
      { message: "🔥 Forging documents in digital flames...", emoji: "🔥", stage: "processing", category: "mystical" },
      { message: "🌟 Sprinkling AI fairy dust everywhere...", emoji: "✨", stage: "processing", category: "mystical" },
      { message: "🎵 Composing symphonies of data...", emoji: "🎼", stage: "processing", category: "creative" },
      { message: "🏗️ Building castles in the cloud...", emoji: "🏰", stage: "processing", category: "construction" },
    ];

    const finalizingMessages = [
      { message: "📚 Binding pages with digital thread...", emoji: "🧵", stage: "finalizing", category: "craft" },
      { message: "🎯 Aiming for perfection, hitting bullseye...", emoji: "🎯", stage: "finalizing", category: "precision" },
      { message: "💎 Polishing diamonds of wisdom...", emoji: "💎", stage: "finalizing", category: "luxury" },
      { message: "🌈 Painting rainbows across your report...", emoji: "🌈", stage: "finalizing", category: "creative" },
      { message: "🏆 Crafting a championship-worthy report...", emoji: "🏆", stage: "finalizing", category: "achievement" },
      { message: "✨ Sprinkling the final magic dust...", emoji: "✨", stage: "finalizing", category: "mystical" },
    ];

    const completingMessages = [
      { message: "🎉 Almost there! Don't press cancel now!", emoji: "⏰", stage: "completing", category: "urgent" },
      { message: "🏁 Crossing the finish line in style...", emoji: "🏃‍♂️", stage: "completing", category: "achievement" },
      { message: "🎊 Preparing the grand finale...", emoji: "🎆", stage: "completing", category: "celebration" },
      { message: "📦 Wrapping your gift with care...", emoji: "🎁", stage: "completing", category: "gift" },
      { message: "🚀 Countdown to report launch: 3... 2... 1...", emoji: "🚀", stage: "completing", category: "space" },
    ];

    const messageInterval = setInterval(() => {
      const timeElapsed = Date.now() - startTime;

      // Select message array based on progress
      let messageArray;
      if (progress < 20) {
        messageArray = initMessages;
      } else if (progress < 60) {
        messageArray = processingMessages;
      } else if (progress < 90) {
        messageArray = finalizingMessages;
      } else {
        messageArray = completingMessages;
      }

      // Get a random message from the appropriate array
      const randomIndex = Math.floor(Math.random() * messageArray.length);
      const newMessage = messageArray[randomIndex];
      setCurrentMessage(newMessage);

      // Show cancel warning after 45 seconds
      if (timeElapsed > 45000 && !showCancelWarning) {
        setShowCancelWarning(true);
      }
    }, 1000); // Change message every 1 second

    return () => clearInterval(messageInterval);
  }, [progress, startTime, showCancelWarning]);

  // Simulate more realistic progress updates
  useEffect(() => {
    if (status === 'generating') {
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) return prev; // Don't go to 100% until actually complete
          return prev + Math.random() * 2; // Random increments for realism
        });
      }, 1000);

      return () => clearInterval(progressInterval);
    }
  }, [status]);

  const generateReports = async () => {
    try {
      setStatus('preparing');
      setProgress(10);

      // Validate required data
      if (!selectedTemplate) {
        throw new Error('No template selected. Please go back and select a template.');
      }

      if (!selectedDataSource) {
        throw new Error('No data source selected. Please go back and select a data source.');
      }

      // For file upload data source, we need the uploaded file
      if (selectedDataSource.type === 'excel_file') {
        const uploadedFile = formData.uploadedFile as File;
        if (!uploadedFile) {
          throw new Error('No file uploaded. Please go back and upload a CSV file.');
        }

        setStatus('generating');
        setProgress(30);

        // Create FormData for the API call
        const apiFormData = new FormData();
        apiFormData.append('csvFile', uploadedFile);
        apiFormData.append('templateId', selectedTemplate.id);
        apiFormData.append('stakeholderAudience', JSON.stringify(['Technical', 'Business']));

        setProgress(50);

        // Call the backend API
        const response = await fetch('/api/generate-reports', {
          method: 'POST',
          body: apiFormData,
        });

        setProgress(80);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to generate reports');
        }

        const result = await response.json();
        setProgress(100);

        // Redirect to the reports preview page
        setTimeout(() => {
          navigate(`/reports/${result.sessionId}`);
        }, 1000);

      } else {
        // For API data sources, we would need to implement the connection logic
        throw new Error(`Data source type "${selectedDataSource.type}" is not yet implemented. Please use file upload for now.`);
      }

    } catch (err) {
      console.error('Report generation error:', err);
      setStatus('error');
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    }
  };

  const handleRetry = () => {
    setStatus('preparing');
    setError('');
    setProgress(0);
    generateReports();
  };

  const handleGoBack = () => {
    navigate('/data-source');
  };

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-3 xs:px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 xs:p-8 text-center">
          <AlertCircle className="h-12 w-12 xs:h-16 xs:w-16 text-red-500 mx-auto mb-3 xs:mb-4" />
          <h2 className="text-lg xs:text-xl font-semibold text-gray-900 mb-3 xs:mb-4">Generation Failed</h2>
          <p className="text-sm xs:text-base text-gray-600 mb-4 xs:mb-6">{error}</p>
          <div className="flex flex-col xs:flex-row gap-3 justify-center">
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors active:scale-95"
            >
              Try Again
            </button>
            <button
              onClick={handleGoBack}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors active:scale-95"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-3 xs:px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 xs:p-8 text-center">
        <Loader2 className="h-12 w-12 xs:h-16 xs:w-16 text-blue-600 mx-auto mb-3 xs:mb-4 animate-spin" />
        <h2 className="text-lg xs:text-xl font-semibold text-gray-900 mb-3 xs:mb-4">
          {status === 'preparing' ? 'Preparing Generation...' : 'Generating Reports...'}
        </h2>

        {/* Engaging AI Progress Message */}
        <div className="mb-4 xs:mb-6 p-3 xs:p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-100">
          <div className="flex items-center justify-center mb-2">
            <span className="text-2xl xs:text-3xl mr-2 animate-bounce">{currentMessage.emoji}</span>
            <p className="text-sm xs:text-base font-medium text-purple-800">
              {currentMessage.message}
            </p>
          </div>

          {/* Show cancel warning if taking too long */}
          {showCancelWarning && (
            <div className="mt-3 p-2 bg-yellow-100 border border-yellow-300 rounded-lg">
              <p className="text-xs xs:text-sm text-yellow-800 font-medium">
                {getCancelWarningMessage().message}
              </p>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-3 xs:mb-4">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <p className="text-sm text-gray-500">{progress}% complete</p>

        {selectedTemplate && (
          <div className="mt-4 xs:mt-6 p-3 xs:p-4 bg-blue-50 rounded-lg">
            <p className="text-xs xs:text-sm text-blue-800">
              <strong>Template:</strong> {selectedTemplate.name}
            </p>
            {selectedDataSource && (
              <p className="text-xs xs:text-sm text-blue-800 mt-1">
                <strong>Data Source:</strong> {selectedDataSource.name}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportGeneration;

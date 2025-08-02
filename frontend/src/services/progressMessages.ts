// Progress Messages Service - AI-Generated Engaging Messages
export interface ProgressMessage {
  message: string;
  emoji: string;
  stage: string;
}

export class ProgressMessageService {
  private static messages: ProgressMessage[] = [
    // Initialization Messages (0-20%)
    { message: "🎭 Calling the magic spirits...", emoji: "✨", stage: "init" },
    { message: "🔮 Awakening the AI overlords...", emoji: "🤖", stage: "init" },
    { message: "🧙‍♂️ Brewing some digital potions...", emoji: "⚗️", stage: "init" },
    { message: "🚀 Launching rockets to the cloud...", emoji: "☁️", stage: "init" },
    { message: "🎪 Setting up the AI circus tent...", emoji: "🎭", stage: "init" },
    
    // Processing Messages (20-60%)
    { message: "🤖 Teaching robots to write poetry...", emoji: "📝", stage: "processing" },
    { message: "🧠 Feeding data to hungry algorithms...", emoji: "🍽️", stage: "processing" },
    { message: "⚡ Channeling lightning into words...", emoji: "⚡", stage: "processing" },
    { message: "🎨 Painting masterpieces with code...", emoji: "🖼️", stage: "processing" },
    { message: "🔥 Forging documents in digital flames...", emoji: "🔥", stage: "processing" },
    { message: "🌟 Sprinkling AI fairy dust everywhere...", emoji: "✨", stage: "processing" },
    { message: "🎵 Composing symphonies of data...", emoji: "🎼", stage: "processing" },
    { message: "🏗️ Building castles in the cloud...", emoji: "🏰", stage: "processing" },
    { message: "🧬 Splicing DNA of pure information...", emoji: "🔬", stage: "processing" },
    { message: "🌊 Surfing waves of neural networks...", emoji: "🏄‍♂️", stage: "processing" },
    
    // Finalizing Messages (60-90%)
    { message: "📚 Binding pages with digital thread...", emoji: "🧵", stage: "finalizing" },
    { message: "🎯 Aiming for perfection, hitting bullseye...", emoji: "🎯", stage: "finalizing" },
    { message: "🔧 Fine-tuning the quantum flux capacitor...", emoji: "⚙️", stage: "finalizing" },
    { message: "💎 Polishing diamonds of wisdom...", emoji: "💎", stage: "finalizing" },
    { message: "🎪 Adding the final circus flourishes...", emoji: "🎭", stage: "finalizing" },
    { message: "🌈 Painting rainbows across your report...", emoji: "🌈", stage: "finalizing" },
    
    // Completion Messages (90-100%)
    { message: "🎉 Almost there! Don't press cancel now!", emoji: "⏰", stage: "completing" },
    { message: "🏁 Crossing the finish line in style...", emoji: "🏃‍♂️", stage: "completing" },
    { message: "🎊 Preparing the grand finale...", emoji: "🎆", stage: "completing" },
    { message: "📦 Wrapping your gift with care...", emoji: "🎁", stage: "completing" },
    
    // Patience Messages (for longer waits)
    { message: "☕ Perfect time for a coffee break!", emoji: "☕", stage: "patience" },
    { message: "🧘‍♀️ Take a deep breath, magic takes time...", emoji: "🕯️", stage: "patience" },
    { message: "🎮 Maybe play a quick game while waiting?", emoji: "🎮", stage: "patience" },
    { message: "📱 Check your messages, we're still cooking!", emoji: "👨‍🍳", stage: "patience" },
    { message: "🌱 Good things grow slowly, like this report!", emoji: "🌿", stage: "patience" },
    { message: "🎭 The show must go on... and it is!", emoji: "🎪", stage: "patience" },
    { message: "🔮 The crystal ball says: 'Almost ready!'", emoji: "🔮", stage: "patience" },
    { message: "🚂 All aboard the patience train! Choo choo!", emoji: "🚂", stage: "patience" },
    
    // Humorous Messages
    { message: "🤖 Robots are arguing about font choices...", emoji: "🤖", stage: "humor" },
    { message: "🐌 Even snails would be faster, but quality matters!", emoji: "🐌", stage: "humor" },
    { message: "🎪 The AI circus is in full swing!", emoji: "🎪", stage: "humor" },
    { message: "🧙‍♂️ Abracadabra! *waves digital wand*", emoji: "🪄", stage: "humor" },
    { message: "🎨 Michelangelo took 4 years, we need 4 minutes!", emoji: "🎨", stage: "humor" },
    { message: "🚀 Houston, we have... a beautiful report!", emoji: "🚀", stage: "humor" },
  ];

  private static getMessagesByStage(stage: string): ProgressMessage[] {
    return this.messages.filter(msg => msg.stage === stage);
  }

  private static getRandomMessage(messages: ProgressMessage[]): ProgressMessage {
    return messages[Math.floor(Math.random() * messages.length)];
  }

  public static getMessageForProgress(progress: number, timeElapsed: number = 0): ProgressMessage {
    // Determine stage based on progress
    let stage: string;
    
    if (progress < 20) {
      stage = "init";
    } else if (progress < 60) {
      stage = "processing";
    } else if (progress < 90) {
      stage = "finalizing";
    } else {
      stage = "completing";
    }

    // If it's taking too long (more than 30 seconds), show patience messages
    if (timeElapsed > 30000) {
      const patientMessages = this.getMessagesByStage("patience");
      const humorMessages = this.getMessagesByStage("humor");
      const allSlowMessages = [...patientMessages, ...humorMessages];
      
      if (allSlowMessages.length > 0) {
        return this.getRandomMessage(allSlowMessages);
      }
    }

    // Get messages for the current stage
    const stageMessages = this.getMessagesByStage(stage);
    
    if (stageMessages.length > 0) {
      return this.getRandomMessage(stageMessages);
    }

    // Fallback message
    return {
      message: "🎭 Creating something amazing for you...",
      emoji: "✨",
      stage: "default"
    };
  }

  public static getMotivationalMessage(): ProgressMessage {
    const motivational = [
      { message: "🌟 Your report will be legendary!", emoji: "🏆", stage: "motivation" },
      { message: "💪 Patience is a superpower!", emoji: "🦸‍♀️", stage: "motivation" },
      { message: "🎯 Excellence is worth the wait!", emoji: "⭐", stage: "motivation" },
      { message: "🚀 We're building something incredible!", emoji: "🌟", stage: "motivation" },
      { message: "💎 Diamonds are made under pressure!", emoji: "💎", stage: "motivation" },
    ];
    
    return this.getRandomMessage(motivational);
  }

  public static getCancelWarningMessage(): ProgressMessage {
    const warnings = [
      { message: "⚠️ Don't cancel now! We're so close!", emoji: "🛑", stage: "warning" },
      { message: "🚨 Canceling now would be like leaving a movie at the climax!", emoji: "🎬", stage: "warning" },
      { message: "⏰ Just a few more seconds of magic!", emoji: "✨", stage: "warning" },
      { message: "🎪 The grand finale is about to begin!", emoji: "🎭", stage: "warning" },
      { message: "🏁 We're in the final stretch!", emoji: "🏃‍♂️", stage: "warning" },
    ];
    
    return this.getRandomMessage(warnings);
  }
}

// Hook for React components
export const useProgressMessages = () => {
  const getMessageForProgress = (progress: number, timeElapsed: number = 0) => {
    return ProgressMessageService.getMessageForProgress(progress, timeElapsed);
  };

  const getMotivationalMessage = () => {
    return ProgressMessageService.getMotivationalMessage();
  };

  const getCancelWarningMessage = () => {
    return ProgressMessageService.getCancelWarningMessage();
  };

  return {
    getMessageForProgress,
    getMotivationalMessage,
    getCancelWarningMessage,
  };
};
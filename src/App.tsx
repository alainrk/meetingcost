import React, { useState, useEffect } from "react";
import * as RadixPopover from "@radix-ui/react-popover";

interface Attendee {
  id: number;
  title: string;
  annualSalary: string;
}

interface Currency {
  symbol: string;
  locale: string;
}

interface Currencies {
  [key: string]: Currency;
}

const App: React.FC = () => {
  const [attendees, setAttendees] = useState<Attendee[]>([
    { id: 1, title: "", annualSalary: "" },
  ]);
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [manualDuration, setManualDuration] = useState("60");
  const [selectedCurrency, setSelectedCurrency] = useState("USD");

  const currencies: Currencies = {
    USD: { symbol: "$", locale: "en-US" },
    EUR: { symbol: "€", locale: "de-DE" },
    GBP: { symbol: "£", locale: "en-GB" },
    JPY: { symbol: "¥", locale: "ja-JP" },
    CNY: { symbol: "¥", locale: "zh-CN" },
    CAD: { symbol: "$", locale: "en-CA" },
    AUD: { symbol: "$", locale: "en-AU" },
    CHF: { symbol: "CHF", locale: "de-CH" },
  };

  // Calculate hourly rate from annual salary
  const getHourlyRate = (annualSalary: string): number => {
    const salary = parseFloat(annualSalary) || 0;
    return salary / (52 * 40); // 52 weeks, 40 hours per week
  };

  // Calculate total cost
  const calculateCost = (minutes: number): number => {
    return attendees.reduce((total, attendee) => {
      const hourlyRate = getHourlyRate(attendee.annualSalary);
      return total + (hourlyRate * minutes) / 60;
    }, 0);
  };

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat(currencies[selectedCurrency].locale, {
      style: "currency",
      currency: selectedCurrency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Format salary
  const formatSalary = (value: string): string => {
    if (!value) return "";
    const number = parseFloat(value.replace(/[^0-9.]/g, ""));
    if (isNaN(number)) return "";
    return new Intl.NumberFormat(currencies[selectedCurrency].locale, {
      style: "currency",
      currency: selectedCurrency,
      maximumFractionDigits: 0,
    }).format(number);
  };

  // Parse salary input
  const parseSalary = (value: string): string => {
    return value.replace(/[^0-9.]/g, "");
  };

  // Add new attendee
  const addAttendee = (): void => {
    setAttendees([
      ...attendees,
      { id: Date.now(), title: "", annualSalary: "" },
    ]);
  };

  // Clone attendee
  const cloneAttendee = (attendee: Attendee): void => {
    setAttendees([
      ...attendees,
      {
        id: Date.now(),
        title: attendee.title,
        annualSalary: attendee.annualSalary,
      },
    ]);
  };

  // Remove attendee
  const removeAttendee = (id: number): void => {
    if (attendees.length > 1) {
      setAttendees(attendees.filter((attendee) => attendee.id !== id));
    }
  };

  // Update attendee information
  const updateAttendee = (
    id: number,
    field: keyof Attendee,
    value: string,
  ): void => {
    setAttendees(
      attendees.map((attendee) =>
        attendee.id === id ? { ...attendee, [field]: value } : attendee,
      ),
    );
  };

  // Increase salary by amount
  const increaseSalary = (id: number, amount: number): void => {
    setAttendees(
      attendees.map((attendee) => {
        if (attendee.id === id) {
          const currentSalary = parseFloat(attendee.annualSalary) || 0;
          return {
            ...attendee,
            annualSalary: (currentSalary + amount).toString(),
          };
        }
        return attendee;
      }),
    );
  };

  // Toggle timer
  const toggleTimer = (): void => {
    if (!isRunning) {
      setStartTime(Date.now() - elapsedTime * 1000);
      setIsRunning(true);
    } else {
      setIsRunning(false);
    }
  };

  // Reset timer
  const resetTimer = (): void => {
    setIsRunning(false);
    setElapsedTime(0);
    setStartTime(null);
  };

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Update elapsed time
  useEffect(() => {
    let intervalId: number;
    if (isRunning && startTime !== null) {
      intervalId = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(intervalId);
  }, [isRunning, startTime]);

  // Style constants
  const buttonBaseStyle =
    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  const buttonDefaultStyle = `${buttonBaseStyle} bg-gray-900 text-white hover:bg-gray-700 h-10 py-2 px-4`;
  const buttonOutlineStyle = `${buttonBaseStyle} border border-input bg-transparent hover:bg-accent hover:text-accent-foreground h-10 py-2 px-4`;
  const buttonIconStyle = `${buttonOutlineStyle} h-10 w-10 p-0`;
  const inputStyle =
    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";
  const cardStyle = "rounded-lg border bg-card text-card-foreground shadow-sm";
  const cardContentStyle = "p-6 pt-0";

  return (
    <div className={cardStyle + " w-full max-w-2xl mx-auto"}>
      <header className="sticky top-0 z-10 bg-gray-100 shadow-sm">
        <div className="container mx-auto flex justify-between items-center p-4">
          <div className="w-8 h-8"></div>
          <h3 className="text-2xl font-semibold leading-none tracking-tight flex items-center gap-2">
            <span className="w-6 h-6">🗓</span>
            Meeting Cost Calculator
          </h3>
          <a
            href="https://github.com/alainrk/meetingcost"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-800 hover:text-gray-600 transition-colors duration-200"
            aria-label="View on GitHub"
          >
            <svg
              className="w-8 h-8"
              fill="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z"
              />
            </svg>
          </a>
        </div>
      </header>

      <div className={cardContentStyle}>
        <div className="space-y-6">
          {/* Currency Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">Currency</label>
            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              className={inputStyle + " w-32"}
            >
              {Object.keys(currencies).map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
          </div>

          {/* Attendees Section */}
          <div className="space-y-4">
            <div className="font-medium">Meeting Attendees</div>
            <div className="text-sm text-gray-500">Total employer cost</div>
            {attendees.map((attendee) => (
              <div key={attendee.id} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Title/Role"
                  value={attendee.title}
                  onChange={(e) =>
                    updateAttendee(attendee.id, "title", e.target.value)
                  }
                  className={inputStyle + " flex-1"}
                />
                <div className="flex-1 flex gap-1">
                  <input
                    type="text"
                    placeholder="Annual Total Cost"
                    value={formatSalary(attendee.annualSalary)}
                    onChange={(e) =>
                      updateAttendee(
                        attendee.id,
                        "annualSalary",
                        parseSalary(e.target.value),
                      )
                    }
                    className={inputStyle + " flex-1"}
                  />
                  <RadixPopover.Root>
                    <RadixPopover.Trigger asChild>
                      <button
                        className={buttonIconStyle}
                        title="Increase salary"
                      >
                        ▲
                      </button>
                    </RadixPopover.Trigger>
                    <RadixPopover.Content className="bg-white rounded-md shadow-lg p-2">
                      <div className="flex gap-1">
                        {[1, 5, 10, 50].map((amount) => (
                          <button
                            key={amount}
                            onClick={() =>
                              increaseSalary(attendee.id, amount * 1000)
                            }
                            className={buttonOutlineStyle}
                          >
                            +{amount}k
                          </button>
                        ))}
                      </div>
                    </RadixPopover.Content>
                  </RadixPopover.Root>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => cloneAttendee(attendee)}
                    className={buttonIconStyle}
                    title="Clone attendee"
                  >
                    ⎘
                  </button>
                  <button
                    onClick={() => removeAttendee(attendee.id)}
                    className={buttonIconStyle}
                    disabled={attendees.length === 1}
                    title="Remove attendee"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
            <button
              onClick={addAttendee}
              className={buttonOutlineStyle + " w-full"}
            >
              + Add Attendee
            </button>
          </div>

          {/* Timer and Manual Input Section */}
          <div className="space-y-4">
            <div className="font-medium">Duration</div>
            <div className="grid grid-cols-2 gap-4">
              {/* Timer */}
              <div className={cardStyle + " p-4"}>
                <h4 className="text-sm font-semibold mb-4">Timer</h4>
                <div className="text-center">
                  <div className="text-2xl font-mono mb-4">
                    {formatTime(elapsedTime)}
                  </div>
                  <div className="space-x-2">
                    <button
                      onClick={toggleTimer}
                      className={
                        isRunning
                          ? buttonBaseStyle +
                            " bg-red-500 hover:bg-red-600 text-white px-3 py-1"
                          : buttonDefaultStyle
                      }
                    >
                      {isRunning ? "Stop" : "Start"}
                    </button>
                    <button
                      onClick={resetTimer}
                      className={buttonOutlineStyle}
                      disabled={elapsedTime === 0}
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>

              {/* Manual Duration */}
              <div className={cardStyle + " p-4"}>
                <h4 className="text-sm font-semibold mb-4">
                  Duration (Manual)
                </h4>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Minutes"
                      value={manualDuration}
                      onChange={(e) => setManualDuration(e.target.value)}
                      className={inputStyle + " flex-1"}
                    />
                    <span className="flex items-center text-sm text-gray-500">
                      min
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cost Display */}
          <div className="grid grid-cols-2 gap-4">
            <div className={cardStyle + " p-4"}>
              <h4 className="text-sm font-semibold mb-2">
                Meeting Cost (Timer)
              </h4>
              <div className="text-xl font-bold text-center text-green-600">
                {formatCurrency(calculateCost(elapsedTime / 60))}
              </div>
            </div>
            <div className={cardStyle + " p-4"}>
              <h4 className="text-sm font-semibold mb-2">
                Meeting Cost (Manual)
              </h4>
              <div className="text-xl font-bold text-center text-green-600">
                {formatCurrency(calculateCost(parseFloat(manualDuration) || 0))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;

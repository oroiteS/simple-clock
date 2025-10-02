# Simple Clock

A simple, web-based alarm clock application to help you manage your schedule and reminders with ease.

## Project Overview

This project is a lightweight and user-friendly alarm clock built with a Python backend and a clean, intuitive frontend. It allows users to set, manage, and customize alarms with features like labels and repeat options. The application is designed to be straightforward and efficient, making it easy to keep track of your important tasks and appointments.

## Features

- **Add and Manage Alarms**: Easily add new alarms with specific times and labels.
- **Customizable Repetition**: Set alarms to repeat daily, weekly, or not at all.
- **Enable/Disable Alarms**: Toggle alarms on or off without deleting them.
- **User-Friendly Interface**: A clean and simple UI for a seamless user experience.
- **Desktop Notifications**: Receive desktop notifications when an alarm goes off.

## Installation

To get started with the Simple Clock application, follow these steps:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/simple-clock.git
   cd simple-clock
   ```

2. **Install dependencies**:
   Make sure you have Python 3.13+ and `uv` installed. Then, run the following command to install the required packages:
   ```bash
   uv pip install -r requirements.txt
   ```

## Usage

1. **Run the application**:
   ```bash
   python src/main.py
   ```

2. **Access the application**:
   Open your web browser and navigate to `http://localhost:8888` to start using the alarm clock.

## Configuration

The application runs with the following default configuration:
- **Host**: `0.0.0.0`
- **Port**: `8888`
- **Debug Mode**: Enabled

These settings can be modified in the `src/main.py` file.

## Dependencies

The project relies on the following Python packages:

- `apscheduler>=3.11.0`
- `flask>=3.1.2`
- `flask-cors>=6.0.1`
- `win10toast>=0.9`

## Contribution

Contributions are welcome! If you have any ideas, suggestions, or bug reports, please open an issue or submit a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.
from flask import Flask, render_template, Response, jsonify
import cv2
import mediapipe as mp

app = Flask(__name__)

# Initialize MediaPipe Hand Tracking
mp_hands = mp.solutions.hands
mp_draw = mp.solutions.drawing_utils
hands = mp_hands.Hands(min_detection_confidence=0.5, min_tracking_confidence=0.5)

# Initialize Webcam
cap = cv2.VideoCapture(0)

# Paddle position variable
paddle_x = 50  # Default paddle position

def generate_frames():
    global paddle_x

    while True:
        success, frame = cap.read()
        if not success:
            break

        frame = cv2.flip(frame, 1)  # Flip horizontally for better experience
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        result = hands.process(rgb_frame)

        if result.multi_hand_landmarks:
            for hand_landmarks in result.multi_hand_landmarks:
                # Get index finger position
                index_finger = hand_landmarks.landmark[8]  # Index finger tip
                paddle_x = int(index_finger.x * 640)  # Convert to screen width
                
                # Draw Hand Landmarks
                mp_draw.draw_landmarks(frame, hand_landmarks, mp_hands.HAND_CONNECTIONS)

        _, buffer = cv2.imencode('.jpg', frame)
        frame_bytes = buffer.tobytes()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/get_paddle_position')
def get_paddle_position():
    return jsonify({'paddle_x': paddle_x})

if __name__ == '__main__':
    app.run(debug=True)

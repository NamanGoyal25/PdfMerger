from flask import Flask, render_template, request, send_file, jsonify
import PyPDF2
import os

app = Flask(__name__)

# Configure upload folder
UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Ensure the upload folder exists
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)


# Route for the homepage
@app.route('/')
def index():
    return render_template('index.html')


# Route to handle PDF upload and merging
@app.route('/merge', methods=['POST'])
def merge_pdfs():
    if 'pdfs' not in request.files:
        return jsonify({'error': 'No PDFs uploaded'}), 400

    pdf_files = request.files.getlist('pdfs')
    if not pdf_files or len(pdf_files) < 2:
        return jsonify({'error': 'Please upload at least 2 PDFs'}), 400

    # Save the uploaded PDFs
    saved_files = []
    for i, pdf_file in enumerate(pdf_files):
        if pdf_file.filename == '':
            return jsonify({'error': 'One or more files are invalid'}), 400
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], f'input_{i}.pdf')
        pdf_file.save(file_path)
        saved_files.append(file_path)

    # Merge the PDFs
    try:
        merger = PyPDF2.PdfMerger()
        for file_path in saved_files:
            with open(file_path, 'rb') as pdfFile:
                pdfReader = PyPDF2.PdfReader(pdfFile)
                merger.append(pdfReader)

        output_path = os.path.join(app.config['UPLOAD_FOLDER'], 'merged.pdf')
        with open(output_path, 'wb') as output_file:
            merger.write(output_file)

        # Clean up input files
        for file_path in saved_files:
            os.remove(file_path)

        return jsonify({'download_url': '/uploads/merged.pdf'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# Route to serve the merged PDF
@app.route('/uploads/<filename>')
def serve_file(filename):
    return send_file(os.path.join(app.config['UPLOAD_FOLDER'], filename))


if __name__ == '__main__':
    app.run(debug=True)

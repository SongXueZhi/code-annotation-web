import ProDescriptions from '@ant-design/pro-descriptions';
import { Button, Input } from 'antd';
import { MonacoDiffEditor } from 'react-monaco-editor';

interface IProps {
  regressionUuid: string;
  revisionFlag: string; // Bug Inducing Commit || Bug Fixing Commit
  criticalChangeOriginal?: string;
  criticalChangeNew?: string;
  fileName: string; // index
  codeRange?: number[];
  endLine?: number[];
}

// interface SearchParams {
//   feedback: string;
// }

// const generateParams = (params: SearchParams) => {
//   return {
//     feedback: params.feedback,
//   };
// };

const mockData = [
  {
    uuid: '64bcef94-d8ee-46c9-a82b-393ef6a1d898',
    // criticalChange: [
    //   '/*******************************************************************************\n * Copyright 2017 Univocity Software Pty Ltd\n *\n * Licensed under the Apache License, Version 2.0 (the "License");\n * you may not use this file except in compliance with the License.\n * You may obtain a copy of the License at\n *\n * http://www.apache.org/licenses/LICENSE-2.0\n *\n * Unless required by applicable law or agreed to in writing, software\n * distributed under the License is distributed on an "AS IS" BASIS,\n * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n * See the License for the specific language governing permissions and\n * limitations under the License.\n ******************************************************************************/\npackage com.univocity.parsers.common.input;\n\nimport java.io.*;\nimport java.nio.charset.*;\n\nimport static com.univocity.parsers.common.ArgumentUtils.*;\n\n/**\n * A wrapper for an {@link InputStream} that attempts to detect a Byte Order Mark (BOM) in the input\n * and derive the character encoding that should be used to decode the incoming content.\n *\n * @author Univocity Software Pty Ltd - <a href="mailto:dev@univocity.com">dev@univocity.com</a>\n */\npublic final class BomInput extends InputStream {\n\n\n\tpublic static final byte[] UTF_8_BOM = toByteArray(0xEF, 0xBB, 0xBF);\n\tpublic static final byte[] UTF_16BE_BOM = toByteArray(0xFE, 0xFF);\n\tpublic static final byte[] UTF_16LE_BOM = toByteArray(0xFF, 0xFE);\n\tpublic static final byte[] UTF_32BE_BOM = toByteArray(0x00, 0x00, 0xFE, 0xFF);\n\tpublic static final byte[] UTF_32LE_BOM = toByteArray(0xFF, 0xFE, 0x00, 0x00);\n\n\tprivate int bytesRead;\n\tprivate int bytes[] = new int[4];\n\tprivate String encoding;\n\tprivate int consumed = 0;\n\n\tprivate final InputStream input;\n\tprivate IOException exception;\n\n\t/**\n\t * Wraps an {@link InputStream} and reads the first bytes found on it to attempt to read a BOM.\n\t *\n\t * @param input the input whose first bytes should be analyzed.\n\t */\n\tpublic BomInput(InputStream input) {\n\t\tthis.input = input;\n\n\t\ttry { //This looks shitty on purpose (all in the name of speed).\n\t\t\tif ((bytes[0] = next()) == 0xEF) {\n\t\t\t\tif ((bytes[1] = next()) == 0xBB) {\n\t\t\t\t\tif ((bytes[2] = next()) == 0xBF) {\n\t\t\t\t\t\tsetEncoding("UTF-8");\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t} else if (bytes[0] == 0xFE) {\n\t\t\t\tif ((bytes[1] = next()) == 0xFF) {\n\t\t\t\t\tsetEncoding("UTF-16BE");\n\t\t\t\t}\n\t\t\t} else if (bytes[0] == 0xFF) {\n\t\t\t\tif ((bytes[1] = next()) == 0xFE) {\n\t\t\t\t\tif ((bytes[2] = next()) == 0x00) {\n\t\t\t\t\t\tif ((bytes[3] = next()) == 0x00) {\n\t\t\t\t\t\t\tsetEncoding("UTF-32LE");\n\t\t\t\t\t\t} else {\n\t\t\t\t\t\t\tsetEncoding("UTF-16LE"); //gotcha!\n\t\t\t\t\t\t}\n\t\t\t\t\t} else {\n\t\t\t\t\t\tsetEncoding("UTF-16LE"); //gotcha!\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t} else if (bytes[0] == 0x00) {\n\t\t\t\tif ((bytes[1] = next()) == 0x00) {\n\t\t\t\t\tif ((bytes[2] = next()) == 0xFE) {\n\t\t\t\t\t\tif ((bytes[3] = next()) == 0xFF) {\n\t\t\t\t\t\t\tsetEncoding("UTF-32BE");\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t}\n\t\t} catch (IOException e) {\n\t\t\t// store the exception for later. We want the wrapper to behave exactly like the original input stream and\n\t\t\t// might need to return any bytes read before this blew up.\n\t\t\texception = e;\n\t\t}\n\t}\n\n\tprivate void setEncoding(String encoding) {\n\t\tthis.encoding = encoding;\n\t\tif (encoding.equals("UTF-16LE")) { //gotcha!\n\t\t\tif (bytesRead == 3) { //third byte not a 0x00\n\t\t\t\tbytesRead = 1;\n\t\t\t\tbytes[0] = bytes[2];\n\t\t\t\ttry {\n\t\t\t\t\tbytes[1] = next(); //reads next byte to be able to decode to a character\n\t\t\t\t} catch (Exception e) {\n\t\t\t\t\texception = (IOException) e;\n\t\t\t\t}\n\t\t\t\treturn;\n\t\t\t} else if (bytesRead == 4) { //fourth byte not a 0x00\n\t\t\t\tbytesRead = 2;\n\t\t\t\tbytes[0] = bytes[2];\n\t\t\t\tbytes[1] = bytes[3];\n\t\t\t\treturn;\n\t\t\t}\n\t\t}\n\t\tthis.bytesRead = 0;\n\t}\n\n\tprivate int next() throws IOException {\n\t\tint out = input.read();\n\t\tbytesRead++;\n\t\treturn out;\n\t}\n\n\t@Override\n\tpublic final int read() throws IOException {\n\t\tif (bytesRead > 0 && bytesRead > consumed) {\n\t\t\tint out = bytes[consumed];\n\n\t\t\t// Ensures that if the original input stream returned a byte, it will be consumed.\n\t\t\t// In case of exceptions, bytes produced prior to the exception will still be returned.\n\t\t\t// Once the last byte has been consumed, the original exception will be thrown.\n\t\t\tif (++consumed == bytesRead && exception != null) {\n\t\t\t\tthrow exception;\n\t\t\t}\n\t\t\treturn out;\n\t\t}\n\t\tif (consumed == bytesRead) {\n\t\t\tconsumed++;\n\t\t\treturn -1;\n\t\t}\n\n\t\tthrow new BytesProcessedNotification(input, encoding);\n\t}\n\n\t/**\n\t * Returns a flag indicating whether or not all bytes read from the wrapped input stream have been consumed. This\n\t * allows client code to determine if the original input stream can be used directly and safely, or if this\n\t * {@code BomInput} wrapper class should be used instead.\n\t *\n\t * If there are stored bytes that need to be consumed before the wrapped input stream is consumed again,\n\t * this method will return {@code true}.\n\t *\n\t * @return {@code false} if there are no bytes stored and the original input stream can be used directly. If this wrapper\n\t * needs to be used to return stored bytes before, then {@code true} will be returned.\n\t */\n\tpublic final boolean hasBytesStored() {\n\t\treturn bytesRead > 0;\n\t}\n\n\t/**\n\t * Returns the detected {@link Charset} determined by the Byte Order Mark (BOM) available in the\n\t * input provided in the constructor of this class.\n\t *\n\t * If no BOM was detected, this method will return {@code null}.\n\t *\n\t * @return the detected {@link Charset} or {@code null} if a BOM could not be matched.\n\t */\n\tpublic final Charset getCharset() {\n\t\tif (encoding == null) {\n\t\t\treturn null;\n\t\t}\n\t\treturn Charset.forName(encoding);\n\t}\n\n\t/**\n\t * Returns the detected encoding name determined by the Byte Order Mark (BOM) available in the\n\t * input provided in the constructor of this class.\n\t *\n\t * If no BOM was detected, this method will return {@code null}.\n\t *\n\t * @return the detected encoding name or {@code null} if a BOM could not be matched.\n\t */\n\tpublic final String getEncoding() {\n\t\treturn encoding;\n\t}\n\n\t/**\n\t * Internal notification exception used to re-wrap the original {@link InputStream} into a {@link Reader}.\n\t * This is required for performance reasons as overriding {@link InputStream#read()} incurs a heavy performance\n\t * penalty when the implementation is native (as in {@link FileInputStream#read()}.\n\t */\n\tpublic static final class BytesProcessedNotification extends RuntimeException {\n\t\tpublic final InputStream input;\n\t\tpublic final String encoding;\n\n\t\tpublic BytesProcessedNotification(InputStream input, String encoding) {\n\t\t\tthis.input = input;\n\t\t\tthis.encoding = encoding;\n\t\t}\n\n\t\t@Override\n\t\tpublic Throwable fillInStackTrace() {\n\t\t\treturn this;\n\t\t}\n\t}\n\n\t@Override\n\tpublic void close() throws IOException {\n\t\tinput.close();\n\t}\n}\n',
    //   '/*******************************************************************************\n * Copyright 2017 Univocity Software Pty Ltd\n *\n * Licensed under the Apache License, Version 2.0 (the "License");\n * you may not use this file except in compliance with the License.\n * You may obtain a copy of the License at\n *\n * http://www.apache.org/licenses/LICENSE-2.0\n *\n * Unless required by applicable law or agreed to in writing, software\n * distributed under the License is distributed on an "AS IS" BASIS,\n * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n * See the License for the specific language governing permissions and\n * limitations under the License.\n ******************************************************************************/\npackage com.univocity.parsers.common.input;\n\nimport java.io.*;\nimport java.nio.charset.*;\n\nimport static com.univocity.parsers.common.ArgumentUtils.*;\n\n/**\n * A wrapper for an {@link InputStream} that attempts to detect a Byte Order Mark (BOM) in the input\n * and derive the character encoding that should be used to decode the incoming content.\n *\n * @author Univocity Software Pty Ltd - <a href="mailto:dev@univocity.com">dev@univocity.com</a>\n */\npublic final class BomInput extends InputStream {\n\n\n\tpublic static final byte[] UTF_8_BOM = toByteArray(0xEF, 0xBB, 0xBF);\n\tpublic static final byte[] UTF_16BE_BOM = toByteArray(0xFE, 0xFF);\n\tpublic static final byte[] UTF_16LE_BOM = toByteArray(0xFF, 0xFE);\n\tpublic static final byte[] UTF_32BE_BOM = toByteArray(0x00, 0x00, 0xFE, 0xFF);\n\tpublic static final byte[] UTF_32LE_BOM = toByteArray(0xFF, 0xFE, 0x00, 0x00);\n\n\tprivate int bytesRead;\n\tprivate int bytes[] = new int[4];\n\tprivate String encoding;\n\tprivate int consumed = 0;\n\n\tprivate final InputStream input;\n\tprivate IOException exception;\n\n\t/**\n\t * Wraps an {@link InputStream} and reads the first bytes found on it to attempt to read a BOM.\n\t *\n\t * @param input the input whose first bytes should be analyzed.\n\t */\n\tpublic BomInput(InputStream input) {\n\t\tthis.input = input;\n\n\t\ttry { //This looks shitty on purpose (all in the name of speed).\n\t\t\tif ((bytes[0] = next()) == 0xEF) {\n\t\t\t\tif ((bytes[1] = next()) == 0xBB) {\n\t\t\t\t\tif ((bytes[2] = next()) == 0xBF) {\n\t\t\t\t\t\tsetEncoding("UTF-8");\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t} else if (bytes[0] == 0xFE) {\n\t\t\t\tif ((bytes[1] = next()) == 0xFF) {\n\t\t\t\t\tsetEncoding("UTF-16BE");\n\t\t\t\t}\n\t\t\t} else if (bytes[0] == 0xFF) {\n\t\t\t\tif ((bytes[1] = next()) == 0xFE) {\n\t\t\t\t\tif ((bytes[2] = next()) == 0x00) {\n\t\t\t\t\t\tif ((bytes[3] = next()) == 0x00) {\n\t\t\t\t\t\t\tsetEncoding("UTF-32LE");\n\t\t\t\t\t\t} else {\n\t\t\t\t\t\t\tsetEncoding("UTF-16LE"); //gotcha!\n\t\t\t\t\t\t}\n\t\t\t\t\t} else {\n\t\t\t\t\t\tsetEncoding("UTF-16LE"); //gotcha!\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t} else if (bytes[0] == 0x00) {\n\t\t\t\tif ((bytes[1] = next()) == 0x00) {\n\t\t\t\t\tif ((bytes[2] = next()) == 0xFE) {\n\t\t\t\t\t\tif ((bytes[3] = next()) == 0xFF) {\n\t\t\t\t\t\t\tsetEncoding("UTF-32BE");\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t}\n\t\t} catch (IOException e) {\n\t\t\t// store the exception for later. We want the wrapper to behave exactly like the original input stream and\n\t\t\t// might need to return any bytes read before this blew up.\n\t\t\texception = e;\n\t\t}\n\t}\n\n\tprivate void setEncoding(String encoding) {\n\t\tthis.encoding = encoding;\n\t\tif (encoding.equals("UTF-16LE")) { //gotcha!\n\t\t\tif (bytesRead == 3) { //third byte not a 0x00\n\t\t\t\tbytesRead = 1;\n\t\t\t\tbytes[0] = bytes[2];\n\t\t\t\ttry {\n\t\t\t\t\tbytes[1] = next(); //reads next byte to be able to decode to a character\n\t\t\t\t} catch (Exception e) {\n\t\t\t\t\texception = (IOException) e;\n\t\t\t\t}\n\t\t\t\treturn;\n\t\t\t} else if (bytesRead == 4) { //fourth byte not a 0x00\n\t\t\t\tbytesRead = 2;\n\t\t\t\tbytes[0] = bytes[2];\n\t\t\t\tbytes[1] = bytes[3];\n\t\t\t\treturn;\n\t\t\t}\n\t\t}\n\t\tthis.bytesRead = 0;\n\t}\n\n\tprivate int next() throws IOException {\n\t\tint out = input.read();\n\t\tbytesRead++;\n\t\treturn out;\n\t}\n\n\t@Override\n\tpublic final int read() throws IOException {\n\t\tif (bytesRead > 0 && bytesRead > consumed) {\n\t\t\tint out = bytes[consumed];\n\n\t\t\t// Ensures that if the original input stream returned a byte, it will be consumed.\n\t\t\t// In case of exceptions, bytes produced prior to the exception will still be returned.\n\t\t\t// Once the last byte has been consumed, the original exception will be thrown.\n\t\t\tif (++consumed == bytesRead && exception != null) {\n\t\t\t\tthrow exception;\n\t\t\t}\n\t\t\treturn out;\n\t\t}\n\t\tif (consumed == bytesRead) {\n\t\t\tconsumed++;\n\t\t\treturn -1;\n\t\t}\n\n\t\tthrow new BytesProcessedNotification(input, encoding);\n\t}\n\n\t/**\n\t * Returns a flag indicating whether or not all bytes read from the wrapped input stream have been consumed. This\n\t * allows client code to determine if the original input stream can be used directly and safely, or if this\n\t * {@code BomInput} wrapper class should be used instead.\n\t *\n\t * If there are stored bytes that need to be consumed before the wrapped input stream is consumed again,\n\t * this method will return {@code true}.\n\t *\n\t * @return {@code false} if there are no bytes stored and the original input stream can be used directly. If this wrapper\n\t * needs to be used to return stored bytes before, then {@code true} will be returned.\n\t */\n\tpublic final boolean hasBytesStored() {\n\t\treturn bytesRead > 0;\n\t}\n\n\t/**\n\t * Returns the detected {@link Charset} determined by the Byte Order Mark (BOM) available in the\n\t * input provided in the constructor of this class.\n\t *\n\t * If no BOM was detected, this method will return {@code null}.\n\t *\n\t * @return the detected {@link Charset} or {@code null} if a BOM could not be matched.\n\t */\n\tpublic final Charset getCharset() {\n\t\tif (encoding == null) {\n\t\t\treturn null;\n\t\t}\n\t\treturn Charset.forName(encoding);\n\t}\n\n\t/**\n\t * Returns the detected encoding name determined by the Byte Order Mark (BOM) available in the\n\t * input provided in the constructor of this class.\n\t *\n\t * If no BOM was detected, this method will return {@code null}.\n\t *\n\t * @return the detected encoding name or {@code null} if a BOM could not be matched.\n\t */\n\tpublic final String getEncoding() {\n\t\treturn encoding;\n\t}\n\n\t/**\n\t * Internal notification exception used to re-wrap the original {@link InputStream} into a {@link Reader}.\n\t * This is required for performance reasons as overriding {@link InputStream#read()} incurs a heavy performance\n\t * penalty when the implementation is native (as in {@link FileInputStream#read()}.\n\t */\n\tpublic static final class BytesProcessedNotification extends RuntimeException {\n\t\tpublic final InputStream input;\n\t\tpublic final String encoding;\n\n\t\tpublic BytesProcessedNotification(InputStream input, String encoding) {\n\t\t\tthis.input = input;\n\t\t\tthis.encoding = encoding;\n\t\t}\n\n\t\t@Override\n\t\tpublic Throwable fillInStackTrace() {\n\t\t\treturn this;\n\t\t}\n\t}\n}\n',
    //   '/*******************************************************************************\n * Copyright 2014 Univocity Software Pty Ltd\n *\n * Licensed under the Apache License, Version 2.0 (the "License");\n * you may not use this file except in compliance with the License.\n * You may obtain a copy of the License at\n *\n * http://www.apache.org/licenses/LICENSE-2.0\n *\n * Unless required by applicable law or agreed to in writing, software\n * distributed under the License is distributed on an "AS IS" BASIS,\n * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n * See the License for the specific language governing permissions and\n * limitations under the License.\n ******************************************************************************/\npackage com.univocity.parsers.common.input;\n\nimport com.univocity.parsers.common.*;\n\nimport java.io.*;\n\n/**\n * A default CharInputReader which only loads batches of characters when requested by the {@link AbstractCharInputReader} through the {@link DefaultCharInputReader#reloadBuffer} method.\n *\n * @author Univocity Software Pty Ltd - <a href="mailto:parsers@univocity.com">parsers@univocity.com</a>\n */\npublic class DefaultCharInputReader extends AbstractCharInputReader {\n\n\tprivate Reader reader;\n\tprivate boolean unwrapping = false;\n\n\t/**\n\t * Creates a new instance with the mandatory characters for handling newlines transparently. Line separators will be detected automatically.\n\t *\n\t * @param normalizedLineSeparator the normalized newline character (as defined in {@link Format#getNormalizedNewline()}) that is used to replace any lineSeparator sequence found in the input.\n\t * @param bufferSize              the buffer size used to store characters read from the input.\n\t * @param whitespaceRangeStart    starting range of characters considered to be whitespace.\n\t * @param closeOnStop\t\t\t  indicates whether to automatically close the input when {@link #stop()} is called\n\t */\n\tpublic DefaultCharInputReader(char normalizedLineSeparator, int bufferSize, int whitespaceRangeStart, boolean closeOnStop) {\n\t\tsuper(normalizedLineSeparator, whitespaceRangeStart, closeOnStop);\n\t\tsuper.buffer = new char[bufferSize];\n\t}\n\n\t/**\n\t * Creates a new instance with the mandatory characters for handling newlines transparently.\n\t *\n\t * @param lineSeparator           the sequence of characters that represent a newline, as defined in {@link Format#getLineSeparator()}\n\t * @param normalizedLineSeparator the normalized newline character (as defined in {@link Format#getNormalizedNewline()}) that is used to replace any lineSeparator sequence found in the input.\n\t * @param bufferSize              the buffer size used to store characters read from the input.\n\t * @param whitespaceRangeStart    starting range of characters considered to be whitespace.\n\t * @param closeOnStop\t\t\t  indicates whether to automatically close the input when {@link #stop()} is called\n\t */\n\tpublic DefaultCharInputReader(char[] lineSeparator, char normalizedLineSeparator, int bufferSize, int whitespaceRangeStart, boolean closeOnStop) {\n\t\tsuper(lineSeparator, normalizedLineSeparator, whitespaceRangeStart, closeOnStop);\n\t\tsuper.buffer = new char[bufferSize];\n\t}\n\n\t@Override\n\tpublic void stop() {\n\t\ttry {\n\t\t\tif (!unwrapping && closeOnStop && reader != null) {\n\t\t\t\treader.close();\n\t\t\t}\n\t\t} catch (IOException e) {\n\t\t\tthrow new IllegalStateException("Error closing input", e);\n\t\t}\n\t}\n\n\t@Override\n\tprotected void setReader(Reader reader) {\n\t\tthis.reader = reader;\n\t\tunwrapping = false;\n\t}\n\n\t/**\n\t * Copies a sequence of characters from the input into the {@link DefaultCharInputReader#buffer}, and updates the {@link DefaultCharInputReader#length} to the number of characters read.\n\t */\n\t@Override\n\tpublic void reloadBuffer() {\n\t\ttry {\n\t\t\tsuper.length = reader.read(buffer, 0, buffer.length);\n\t\t} catch (IOException e) {\n\t\t\tthrow new IllegalStateException("Error reading from input", e);\n\t\t} catch (BomInput.BytesProcessedNotification notification) {\n\t\t\tunwrapping = true;\n\t\t\tunwrapInputStream(notification);\n\t\t}\n\t}\n}\n',
    //   '/*******************************************************************************\n * Copyright 2014 Univocity Software Pty Ltd\n *\n * Licensed under the Apache License, Version 2.0 (the "License");\n * you may not use this file except in compliance with the License.\n * You may obtain a copy of the License at\n *\n * http://www.apache.org/licenses/LICENSE-2.0\n *\n * Unless required by applicable law or agreed to in writing, software\n * distributed under the License is distributed on an "AS IS" BASIS,\n * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n * See the License for the specific language governing permissions and\n * limitations under the License.\n ******************************************************************************/\npackage com.univocity.parsers.common.input;\n\nimport com.univocity.parsers.common.*;\n\nimport java.io.*;\n\n/**\n * A default CharInputReader which only loads batches of characters when requested by the {@link AbstractCharInputReader} through the {@link DefaultCharInputReader#reloadBuffer} method.\n *\n * @author Univocity Software Pty Ltd - <a href="mailto:parsers@univocity.com">parsers@univocity.com</a>\n */\npublic class DefaultCharInputReader extends AbstractCharInputReader {\n\n\tprivate Reader reader;\n\n\t/**\n\t * Creates a new instance with the mandatory characters for handling newlines transparently. Line separators will be detected automatically.\n\t *\n\t * @param normalizedLineSeparator the normalized newline character (as defined in {@link Format#getNormalizedNewline()}) that is used to replace any lineSeparator sequence found in the input.\n\t * @param bufferSize              the buffer size used to store characters read from the input.\n\t * @param whitespaceRangeStart    starting range of characters considered to be whitespace.\n\t * @param closeOnStop\t\t\t  indicates whether to automatically close the input when {@link #stop()} is called\n\t */\n\tpublic DefaultCharInputReader(char normalizedLineSeparator, int bufferSize, int whitespaceRangeStart, boolean closeOnStop) {\n\t\tsuper(normalizedLineSeparator, whitespaceRangeStart, closeOnStop);\n\t\tsuper.buffer = new char[bufferSize];\n\t}\n\n\t/**\n\t * Creates a new instance with the mandatory characters for handling newlines transparently.\n\t *\n\t * @param lineSeparator           the sequence of characters that represent a newline, as defined in {@link Format#getLineSeparator()}\n\t * @param normalizedLineSeparator the normalized newline character (as defined in {@link Format#getNormalizedNewline()}) that is used to replace any lineSeparator sequence found in the input.\n\t * @param bufferSize              the buffer size used to store characters read from the input.\n\t * @param whitespaceRangeStart    starting range of characters considered to be whitespace.\n\t * @param closeOnStop\t\t\t  indicates whether to automatically close the input when {@link #stop()} is called\n\t */\n\tpublic DefaultCharInputReader(char[] lineSeparator, char normalizedLineSeparator, int bufferSize, int whitespaceRangeStart, boolean closeOnStop) {\n\t\tsuper(lineSeparator, normalizedLineSeparator, whitespaceRangeStart, closeOnStop);\n\t\tsuper.buffer = new char[bufferSize];\n\t}\n\n\t@Override\n\tpublic void stop() {\n\t\ttry {\n\t\t\tif (closeOnStop && reader != null) {\n\t\t\t\treader.close();\n\t\t\t}\n\t\t} catch (IOException e) {\n\t\t\tthrow new IllegalStateException("Error closing input", e);\n\t\t}\n\t}\n\n\t@Override\n\tprotected void setReader(Reader reader) {\n\t\tthis.reader = reader;\n\t}\n\n\t/**\n\t * Copies a sequence of characters from the input into the {@link DefaultCharInputReader#buffer}, and updates the {@link DefaultCharInputReader#length} to the number of characters read.\n\t */\n\t@Override\n\tpublic void reloadBuffer() {\n\t\ttry {\n\t\t\tsuper.length = reader.read(buffer, 0, buffer.length);\n\t\t} catch (IOException e) {\n\t\t\tthrow new IllegalStateException("Error reading from input", e);\n\t\t} catch (BomInput.BytesProcessedNotification notification) {\n\t\t\tstop();\n\t\t\tunwrapInputStream(notification);\n\t\t}\n\t}\n}\n',
    // ],
    codeRange: [203, 207, 61, 62],
  },
  {
    uuid: 'cfccf309-bbbe-42d2-865b-2a50a1288113',
    // filename: 'CsvFormatDetector.java',
    // criticalChange: [],
    codeRange: [148, 148, 271, 286],
  },
  {
    uuid: '4efd2990-bd48-418e-9636-c035abd850f5',
    // criticalChange: [
    //   'public boolean apply(String label) {\n            if (excludes != null) {\n                return Arrays.binarySearch(excludes, label) == -1;\n            }\n',
    //   'return includes != null // \n                    && Arrays.binarySearch(includes, label) >= 0;\n        }\n    }\n',
    // ],
    codeRange: [148, 148, 254, 268],
  },
  {
    uuid: '156eb75f-0b5a-4a35-bd59-db0a57ed9f0e',
    // criticalChange: [
    //   'public boolean apply(String label) {\n            if (excludes != null) {\n                return Arrays.binarySearch(excludes, label) == -1;\n            }\n',
    //   'return includes != null // \n                    && Arrays.binarySearch(includes, label) >= 0;\n        }\n    }\n',
    // ],
    codeRange: [2059, 2070, 913, 913],
  },
  {
    uuid: 'bd2ab6c2-5681-4605-ae06-3ee3ca0ad51b',
    // criticalChange: [
    //   'public boolean apply(String label) {\n            if (excludes != null) {\n                return Arrays.binarySearch(excludes, label) == -1;\n            }\n',
    //   'return includes != null // \n                    && Arrays.binarySearch(includes, label) >= 0;\n        }\n    }\n',
    // ],
    codeRange: [2059, 2070, 913, 913],
  },
  {
    uuid: '19c7bc2b-8cc9-4477-b155-8c3a13bab168',
    // criticalChange: [
    //   'public boolean apply(String label) {\n            if (excludes != null) {\n                return Arrays.binarySearch(excludes, label) == -1;\n            }\n',
    //   'return includes != null // \n                    && Arrays.binarySearch(includes, label) >= 0;\n        }\n    }\n',
    // ],
    codeRange: [148, 148, 321, 327],
  },
  {
    uuid: '76ea45dc-c810-4c26-b104-54a19c041ba0',
    // criticalChange: [
    //   'public boolean apply(String label) {\n            if (excludes != null) {\n                return Arrays.binarySearch(excludes, label) == -1;\n            }\n',
    //   'return includes != null // \n                    && Arrays.binarySearch(includes, label) >= 0;\n        }\n    }\n',
    // ],
    codeRange: [147, 173, 5, 5],
  },
  {
    uuid: '82333b1d-79cf-449b-8b06-c2b042bb56a4',
    // criticalChange: [
    //   'public boolean apply(String label) {\n            if (excludes != null) {\n                return Arrays.binarySearch(excludes, label) == -1;\n            }\n',
    //   'return includes != null // \n                    && Arrays.binarySearch(includes, label) >= 0;\n        }\n    }\n',
    // ],
    codeRange: [124, 144, 140, 140],
  },
  {
    uuid: '7606319e-1f8e-467d-b3fc-f51331f8c0a4',
    // criticalChange: [
    //   'public boolean apply(String label) {\n            if (excludes != null) {\n                return Arrays.binarySearch(excludes, label) == -1;\n            }\n',
    //   'return includes != null // \n                    && Arrays.binarySearch(includes, label) >= 0;\n        }\n    }\n',
    // ],
    codeRange: [365, 375, 365, 365],
  },
  {
    uuid: 'f5d0e242-30be-42c6-a852-082c958f0907',
    // criticalChange: [
    //   'public boolean apply(String label) {\n            if (excludes != null) {\n                return Arrays.binarySearch(excludes, label) == -1;\n            }\n',
    //   'return includes != null // \n                    && Arrays.binarySearch(includes, label) >= 0;\n        }\n    }\n',
    // ],
    codeRange: [181, 183, 182, 182],
  },
];

const CodeDetails = ({
  regressionUuid,
  revisionFlag,
  criticalChangeOriginal,
  criticalChangeNew,
  fileName,
}: IProps) => {
  const target = mockData.find((d) => {
    return d.uuid === regressionUuid;
  });

  return (
    <>
      {target !== undefined ? (
        <ProDescriptions column={2} title={fileName + ' Code Details'}>
          <ProDescriptions.Item label="Regression Uuid">{regressionUuid}</ProDescriptions.Item>
          <ProDescriptions.Item label="Revision Flag">{revisionFlag}</ProDescriptions.Item>
          {revisionFlag === 'Bug Inducing Commit' ? (
            <ProDescriptions.Item span={2} label="Critical change Line Range">
              {target.codeRange[0]} ~ {target.codeRange[1]}
            </ProDescriptions.Item>
          ) : (
            <ProDescriptions.Item span={2} label="Code Line Range">
              {target.codeRange[2]} ~ {target.codeRange[3]}
            </ProDescriptions.Item>
          )}
          <ProDescriptions.Item span={2} label="Critical Change" valueType="code">
            <MonacoDiffEditor
              width={1250}
              height={400}
              language={'java'}
              options={{
                renderSideBySide: false,
                originalEditable: false,
                fontSize: 14,
                lineHeight: 18,
                folding: false,
                scrollbar: {
                  verticalScrollbarSize: 0,
                  verticalSliderSize: 14,
                  horizontalScrollbarSize: 0,
                  horizontalSliderSize: 14,
                  alwaysConsumeMouseWheel: false,
                },
                renderIndicators: false,
              }}
              original={criticalChangeOriginal}
              value={criticalChangeNew}
              editorDidMount={(diffEditor, monaco) => {
                if (revisionFlag === 'Bug Inducing Commit') {
                  diffEditor.revealLineInCenter(target.codeRange[0]);
                } else {
                  diffEditor.revealLineInCenter(target.codeRange[2]);
                }
                // monaco.editor.colorizeModelLine(monaco.editor.getModels()[0], 2);
              }}
            />
          </ProDescriptions.Item>
          <ProDescriptions.Item span={2} label="feedback">
            <Input.Group compact>
              <Input.TextArea
                rows={3}
                showCount
                allowClear
                maxLength={200}
                style={{ width: 'calc(100% - 200px)' }}
              />
              <Button type="primary" style={{ display: 'flex' }}>
                Submit
              </Button>
            </Input.Group>
          </ProDescriptions.Item>
        </ProDescriptions>
      ) : (
        <div>Error</div>
      )}
    </>
  );
};

export default CodeDetails;

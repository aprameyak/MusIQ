import Foundation

class APIService {
    static let shared = APIService()
    
    private let baseURL: String
    private let session: URLSession
    
    init(baseURL: String? = nil) {
        self.baseURL = baseURL ?? ProcessInfo.processInfo.environment["API_BASE_URL"] ?? "http:
        
        let configuration = URLSessionConfiguration.default
        configuration.timeoutIntervalForRequest = 30
        configuration.timeoutIntervalForResource = 60
        self.session = URLSession(configuration: configuration)
    }
    
    func request<T: Decodable>(
        endpoint: String,
        method: HTTPMethod = .get,
        body: Encodable? = nil,
        requiresAuth: Bool = true
    ) async throws -> T {
        guard let url = URL(string: "\(baseURL)\(endpoint)") else {
            throw NetworkError.invalidURL
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = method.rawValue
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        
        if requiresAuth {
            if let token = KeychainHelper.retrieve(forKey: "accessToken") {
                request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
            }
        }
        
        if let body = body {
            do {
                request.httpBody = try JSONEncoder().encode(body)
            } catch {
                throw NetworkError.encodingError
            }
        }
        
        do {
            let (data, response) = try await session.data(for: request)
            
            guard let httpResponse = response as? HTTPURLResponse else {
                throw NetworkError.unknown(NSError(domain: "APIService", code: -1))
            }
            
            if (200...299).contains(httpResponse.statusCode) {
                do {
                    let decoder = JSONDecoder()
                    decoder.dateDecodingStrategy = .iso8601
                    return try decoder.decode(T.self, from: data)
                } catch let decodingError {
                    if let jsonString = String(data: data, encoding: .utf8) {
                        print("Decoding Error - Response JSON: \(jsonString)")
                    }
                    print("Decoding Error Details: \(decodingError)")
                    throw NetworkError.unknown(decodingError)
                }
            }
            
            var message: String = "Server error: \(httpResponse.statusCode)"
            if !data.isEmpty {
                if let jsonObject = try? JSONSerialization.jsonObject(with: data, options: []),
                   let json = jsonObject as? [String: Any] {
                    if let errorDict = json["error"] as? [String: Any],
                       let serverMessage = errorDict["message"] as? String,
                       !serverMessage.isEmpty {
                        message = serverMessage
                    } else if let serverMessage = json["message"] as? String,
                              !serverMessage.isEmpty {
                        message = serverMessage
                    }
                }
            }
            
            throw NetworkError.unknown(NSError(domain: "APIService", code: httpResponse.statusCode, userInfo: [NSLocalizedDescriptionKey: message]))
        } catch let error as NetworkError {
            throw error
        } catch {
            throw NetworkError.unknown(error)
        }
    }
}

enum HTTPMethod: String {
    case get = "GET"
    case post = "POST"
    case put = "PUT"
    case delete = "DELETE"
    case patch = "PATCH"
}

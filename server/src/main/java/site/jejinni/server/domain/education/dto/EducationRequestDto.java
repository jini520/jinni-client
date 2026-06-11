package site.jejinni.server.domain.education.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class EducationRequestDto {
	private String education;
	private LocalDate startDate;
	private LocalDate endDate;
	private String status;
	private String description;
	private Integer orderIndex;
}

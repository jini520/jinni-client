package site.jejinni.server.domain.education.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import site.jejinni.server.domain.education.entity.Education;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EducationDto {
	private UUID id;
	private String education;
	private LocalDate startDate;
	private LocalDate endDate;
	private String status;
	private String description;

	public static EducationDto from(Education education) {
		return EducationDto.builder()
				.id(education.getId())
				.education(education.getEducation())
				.startDate(education.getStartDate())
				.endDate(education.getEndDate())
				.status(education.getStatus())
				.description(education.getDescription())
				.build();
	}
}
